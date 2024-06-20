import { NextFunction } from "express"
import { catchAsync, sendResponse } from "../utils/api.util"
import { CustomRequest } from "./auth"
import AppError from "../utils/AppError";
import PaymentDetails from "../models/paymentDetails";

export const isSubscribed = catchAsync(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const paymentDetails = await PaymentDetails.findOne({userId: req.user._id});
        const currDate = new Date(Date.now());
        if(!paymentDetails || paymentDetails.validUntil < currDate) {
            return next(new AppError(401, "Please subscribe to access"));
        }
        next();
    }
);