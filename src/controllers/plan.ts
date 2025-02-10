import { Request, Response, NextFunction } from "express";
import { catchAsync, sendResponse, sendToken } from "../utils/api.util";
import AppError from "../utils/AppError";
import Plans from "../models/plans";

export const list = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const plans = await Plans.find().sort({tier : 1});

    return sendResponse(res, 200, plans);
})