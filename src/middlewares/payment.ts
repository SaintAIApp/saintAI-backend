import { NextFunction } from "express"
import { catchAsync, sendResponse } from "../utils/api.util"
import { CustomRequest } from "./auth"
import StripeDetails from "../models/stripeDetails";
import AppError from "../utils/AppError";

export const isSubscribed = catchAsync(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const stripeDetails = await StripeDetails.findOne({userId: req.user._id});
        const currDate = new Date(Date.now());
        if(stripeDetails?.validUntil && stripeDetails?.validUntil < currDate) {
            return next(new AppError(401, "PLease subscribe to access"));
        }

        next();
    }
);