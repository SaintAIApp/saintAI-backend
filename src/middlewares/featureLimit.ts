import { NextFunction } from "express";
import { catchAsync } from "../utils/api.util";
import { CustomRequest } from "./auth";
import { isAllowed } from "../utils/checkLimits";
import AppError from "../utils/AppError";

export const isFeatureAllowed = catchAsync(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const {featureId} = req.body;    
        const allowed = await isAllowed(req.user, featureId)    
        if(!allowed) {
            throw new AppError(403, "Access Denied: Daily Limit Reached");
        }
        next();
    }
);