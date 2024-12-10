import { Request, NextFunction, Response } from "express";
import { catchAsync, sendResponse } from "../utils/api.util";
import FinanceData from "../models/financeData";
import axios from "axios";
import AppError from "../utils/AppError";
import SolPrice from "../models/solPrice";

export const stocks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const data = await FinanceData.find({ type: "STOCK" });
  return sendResponse(res, 200, data);
});

export const crypto = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const data = await FinanceData.find({ type: "CRYPTO" });
  return sendResponse(res, 200, data);
});

export const news = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const url = new URL(process.env.APLHAVANTAGE_URL as string);
  url.searchParams.append("apikey", process.env.APLHAVANTAGE_API_KEY as string);
  url.searchParams.append("function", "NEWS_SENTIMENT");
  url.searchParams.append("limit", "1000");

  const { data } = await axios.get(url.toString());

  if (!data.feed) {
    return next(new AppError(500, "Unable to fetch news at this moment"));
  }
  console.log(data)
  return sendResponse(res, 200, data.feed);
});

export const getSolPrice = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const latestPrice = await SolPrice.findOne().sort({ timestamp: -1 });

    if (!latestPrice) {
      return next(new AppError(404, "No SOL price data available"));
    }

    return sendResponse(res, 200, {
      price: latestPrice.priceUSD,
      timestamp: latestPrice.timestamp
    });
  } catch (error) {
    return next(new AppError(500, "Error fetching SOL price from database"));
  }
});
