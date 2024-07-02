import { Request, NextFunction, Response } from "express";
import { catchAsync, sendResponse } from "../utils/api.util";
import FinanceData from "../models/financeData";
import axios from "axios";
import AppError from "../utils/AppError";

export const stocks = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = await FinanceData.find({type: "STOCK"});
    return sendResponse(res, 200, data);
});

export const crypto = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = await FinanceData.find({type: "CRYPTO"});
    return sendResponse(res, 200, data);
});

export const news = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const url = new URL(process.env.APLHAVANTAGE_URL as string);
    url.searchParams.append("apikey", process.env.APLHAVANTAGE_API_KEY as string);
    url.searchParams.append("function", "NEWS_SENTIMENT");

    const {data} = await axios.get(url.toString());
    
    if(!data.feed) {
        return next(new AppError(500, "Unable to fetch news at this moment"));
    }

    return sendResponse(res, 200, data.feed);
});