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

// cron.schedule("0 1 * * * *", () => {
// cron.schedule("0 0 14 * * *", async () => {

//     await FinanceData.deleteMany({})

//     const url = new URL(process.env.APLHAVANTAGE_URL as string);
//     url.searchParams.append("apikey", process.env.APLHAVANTAGE_API_KEY as string);
//     url.searchParams.append("interval", "60min");
//     url.searchParams.append("function", "TIME_SERIES_INTRADAY");

//     const symbols = ["AAPL", "MSFT", "GOOG", "AMZN", "META", "TSLA", "NVDA", "BRK.B", "JNJ", "V", "JPM", "005930.KS", "TSM", "WMT", "PG", "UNH", "ROG", "NVS", "HD"];
//     //const symbols = ["AAPL"];
//     try {
        
//         symbols.map(async (symbol) => {

//             url.searchParams.append("symbol", symbol);

//             const {data} = await axios.get(url.toString());

//             url.searchParams.delete("symbol");

//             if(!data["Meta Data"] || !data["Time Series (60min)"]) {
//                 console.log("Stock Data: "+data);                
//                 throw new AppError(500, "Error while requesting stock data");
//             }

//             await FinanceData.create({
//                 symbol: data["Meta Data"]["2. Symbol"],
//                 data: data["Time Series (60min)"],
//                 type: "STOCK"
//             });
//         });
//     } catch(err) {
//         throw new AppError(500, "Error while requesting stock data")
//     }

//     url.searchParams.set("function", "CRYPTO_INTRADAY");
//     url.searchParams.append("market", "USD");
//     const cryptoSymbol = ["BTC", "ETH", "BNB", "ADA", "SOL", "XRP", "DOT", "DOGE", "USDC", "USDT", "SHIB", "LINK", "LTC", "BCH", "VET", "ETC", "THETA", "XLM", "FIL", "AVAX"];
//     //const cryptoSymbol = ["BTC"];

//     try {
//         cryptoSymbol.map(async (symbol) => {

//             url.searchParams.append("symbol", symbol);
//             console.log(url.toString());

//             const {data} = await axios.get(url.toString());

//             url.searchParams.delete("symbol");

//             if(!data["Meta Data"] || !data["Time Series Crypto (60min)"]) {            
//                 console.log("Crypto Data: "+ data);
//                 throw new AppError(500, "Error while requesting stock data");
//             }

//             await FinanceData.create({
//                 symbol: data["Meta Data"]["2. Digital Currency Code"],
//                 data: data["Time Series Crypto (60min)"],
//                 type: "CRYPTO"
//             });
//         });
//     } catch(err) {
//         throw new AppError(500, "Error while requesting crypto data")
//     }
// })
cron.schedule("0 47 15 * * *", async () => {
    await FinanceData.deleteMany({});

    //const symbols = ["AAPL", "MSFT", "GOOG", "AMZN", "META", "TSLA", "NVDA", "BRK.B", "JNJ", "V", "JPM", "005930.KS", "TSM", "WMT", "PG", "UNH", "ROG", "NVS", "HD"];
    const symbols = ["AAPL", "MSFT", "GOOG", "AMZN", "META", "TSLA", "NVDA", "BRK.B"];

    const cryptoSymbols = ["BTC", "ETH", "BNB", "ADA", "SOL", "XRP", "DOT", "DOGE", "USDC", "USDT", "SHIB", "LINK", "LTC", "BCH", "VET", "ETC", "THETA", "XLM", "FIL", "AVAX"];

    const fetchData = async (url: string) => {
        try {
            const { data } = await axios.get(url);
            return data;
        } catch (err) {
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

        const data = await fetchData(url.toString());

        if (!data["Meta Data"] || !(type === "STOCK" ? data["Time Series (60min)"] : data["Time Series Crypto (60min)"])) {
            throw new AppError(500, "Error while requesting data");
        }

        await FinanceData.create({
            symbol: type === "STOCK" ? data["Meta Data"]["2. Symbol"] : data["Meta Data"]["2. Digital Currency Code"],
            data: type === "STOCK" ? data["Time Series (60min)"] : data["Time Series Crypto (60min)"],
            type: type
        });
        console.log("Finance Data created");
        
    };

    try {
        console.log("Processing stocks...");
        await Promise.all(symbols.map(symbol => processData(symbol, "STOCK")));
        await Promise.all(cryptoSymbols.map(async (symbol) => await processData(symbol, "CRYPTO")));
    } catch (err) {
        throw new AppError(500, "Error while processing data");
    }
});

export default app;