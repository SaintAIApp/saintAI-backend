import express from 'express'
import globalErrorHandler from './controllers/error';
import bodyParser from 'body-parser';
import userRouter from "./routers/user"
import paymentRouter from "./routers/payment"
import uploadRouter from './routers/upload'
import financeRouter from './routers/finance'
import cors from 'cors'
import cron from "node-cron"
import AppError from './utils/AppError';
import axios from 'axios';
import FinanceData from './models/financeData';
const app = express();

app.use(cors());
app.use('/api/v1/payment/webhook', express.raw({ type: 'application/json' }));

app.use(bodyParser.json());
app.get("/",(req,res)=>res.send("Hello from SAINTAI"))
app.use("/api/v1/user", userRouter);
app.use("/api/v1/payment", paymentRouter)
app.use("/api/v1/upload", uploadRouter)
app.use("/api/v1/finance", financeRouter)

// Unhandled Routes:
app.all("*", (req, res, next) => {
    res.status(404).json({
        status: "fail",
        message: `Can't find ${req.originalUrl} on this server`,
    });
});

app.use(globalErrorHandler);

process.on("uncaughtException", (err: any) => {
    console.log("Uncaught Exception, shutting down...");
    console.log(err.name, err.message);
    process.exit(1);
});

cron.schedule("1 *  * * *", async () => {
    await FinanceData.deleteMany({});

    const symbols = ["AAPL", "MSFT", "GOOG", "AMZN", "META", "TSLA", "NVDA", "JNJ", "V", "JPM", "TSM", "WMT", "PG", "UNH", "ROG", "NVS", "HD"];
    const cryptoSymbols = ["BTC", "ETH", "ADA", "SOL", "XRP", "DOT", "DOGE", "USDT", "SHIB", "LINK", "LTC", "BCH", "VET", "ETC", "XLM", "FIL", "AVAX"];

    const fetchData = async (url: string) => {
        try {
            const { data } = await axios.get(url);
            return data;
        } catch (err) {
            console.error(`Error while requesting data from ${url}:`, err);
            throw new AppError(500, "Error while requesting data");
        }
    };

    const processData = async (symbol: string, type: string) => {
        let url = new URL(process.env.APLHAVANTAGE_URL as string);
        url.searchParams.append("apikey", process.env.APLHAVANTAGE_API_KEY as string);
        url.searchParams.append("interval", "60min");
        if (type === "STOCK") {
            url.searchParams.append("function", "TIME_SERIES_INTRADAY");
            url.searchParams.append("symbol", symbol);
        } else if (type === "CRYPTO") {
            url.searchParams.append("function", "CRYPTO_INTRADAY");
            url.searchParams.append("symbol", symbol);
            url.searchParams.append("market", "USD");
        }

        try {
            const data = await fetchData(url.toString());

            if (!data["Meta Data"] || !(type === "STOCK" ? data["Time Series (60min)"] : data["Time Series Crypto (60min)"])) {
                console.error(`Invalid data received for ${symbol}:`, data);
                throw new AppError(500, "Invalid data received");
            }

            await FinanceData.create({
                symbol: type === "STOCK" ? data["Meta Data"]["2. Symbol"] : data["Meta Data"]["2. Digital Currency Code"],
                data: type === "STOCK" ? data["Time Series (60min)"] : data["Time Series Crypto (60min)"],
                type: type
            });

            console.log(`Successfully processed data for ${symbol} (${type})`);
        } catch (err) {
            console.error(`Error processing data for ${symbol} (${type}):`, err);
            throw err;
        }
    };

    try {
        await Promise.all(symbols.map(symbol => processData(symbol, "STOCK")));
        console.log("Successfully processed all stock data");
    } catch (err) {
        console.error("Error processing stock data:", err);
    }

    try {
        await Promise.all(cryptoSymbols.map(symbol => processData(symbol, "CRYPTO")));
        console.log("Successfully processed all crypto data");
    } catch (err) {
        console.error("Error processing crypto data:", err);
    }
});


export default app;