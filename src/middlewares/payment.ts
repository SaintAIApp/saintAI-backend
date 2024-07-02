import { NextFunction } from "express"
import { catchAsync, sendResponse } from "../utils/api.util"
import { CustomRequest } from "./auth"
import AppError from "../utils/AppError";
import PaymentDetails from "../models/paymentDetails";

export const isSubscribed = catchAsync(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const paymentDetails = await PaymentDetails.findOne({userId: req.user._id});
        const currDate = new Date(Date.now()).getTime();
        if(!paymentDetails){
            return next(new AppError(401, "Please subscribe to access"));
        }
        const expiryDate = new Date(paymentDetails.validUntil).getTime();
        console.log(expiryDate+" "+currDate)
        if(!paymentDetails || expiryDate < currDate) {
            return next(new AppError(401, "Please subscribe to access"));
        }
        console.log("User is Subcribed")
        next();
    }
);