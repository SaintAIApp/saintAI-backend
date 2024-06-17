import { Request, NextFunction, Response } from "express";
import { catchAsync, sendResponse } from "../utils/api.util";
import PaymentServices from '../services/payment'
import AppError from "../utils/AppError";
import { CustomRequest } from "../middlewares/auth";
import StripeDetails from "../models/stripeDetails";
import PaymentDetails from "../models/paymentDetails";

export const onPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers["stripe-signature"]

    if(!sig) {
        return next(new AppError(500, "Error while payment"))
    }

    await PaymentServices.onPayment(sig, req.body);

    sendResponse(res, 200, {
        "message": "Payment successfull"
    })
});

export const createCheckout = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const {plan} = req.body;

    if(!plan && !["pro", "proPlus"].includes(plan)) {
        return next(new AppError(400, "Invalid subscription type"));
    }

    const user = await StripeDetails.findById(req.user._id);

    const url = await PaymentServices.createCheckout(plan, req.user._id, user?.customerId);

    if(!url) {
        return next(new AppError(500, "Error while creating session"));
    }

    return sendResponse(res, 200, url);
});

export const cancelSubscription = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userId = req.user._id;

    await PaymentServices.cancelSubscription(userId);

    return sendResponse(res, 200, {
        message: "Successfully unsubscribed from saint.ai"
    })
});