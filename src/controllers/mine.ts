import { Request, Response, NextFunction } from "express";
import { catchAsync, sendResponse, sendToken } from "../utils/api.util";
import AppError from "../utils/AppError";
import MiningService from "../services/mining";

export const getDetailMining = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId= req.params.userId;
    if(!userId) {
        return next(new AppError(400, "Please provide UserId"));
    }
    const miningDetail = await MiningService.getMining(userId)

    return sendResponse(res, 200, miningDetail);
})