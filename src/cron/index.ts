import axios from "axios";
import FinanceData from "../models/financeData";
import SolPrice from "../models/solPrice";
import AppError from "../utils/AppError";
import { schedule } from 'node-cron';

export async function startCronJobs() {
  schedule("1 * * * *", async () => {
    try {
      await fetchStockData();
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  },
    {
      runOnInit: true,
    }
  );
  schedule("*/2 * * * *", async () => {
    try {
      await fetchSolPrice();
    } catch (error) {
      console.error("Error fetching SOLANA price:", error);
    }
  }, {
    runOnInit: true,
  });
};

async function fetchStockData() {
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
}

async function fetchSolPrice() {
  const url = "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd";
  try {
    const { data } = await axios.get(url, {
      headers: {
        "Content-Type": "application/json"
      },
    });
    if (!data.solana || !data.solana.usd) {
      throw new AppError(500, "Unable to fetch SOL price at this moment");
    }

    const solPrice = new SolPrice({
      timestamp: new Date(),
      priceUSD: data.solana.usd
    });

    await solPrice.save();
    console.log(`Successfully saved SOL price: ${data.solana.usd}`);
  } catch (error) {
    console.error("Error fetching or saving SOL price:", error);
    throw new AppError(500, "Error fetching or saving SOL price");
  }
}
