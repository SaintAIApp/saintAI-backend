import { Request, Response, NextFunction } from "express";
import { catchAsync, sendResponse, sendToken } from "../utils/api.util";
import AppError from "../utils/AppError";
import UserServices from '../services/user'
import { CustomRequest } from "../middlewares/auth";

export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {username, email, password } = req.body;

    if(!username || !email || !password) {
        return next(new AppError(404, "Please provide Username, Email and Password"));
    }

    const user = await UserServices.signup(username, email, password);

    return sendResponse(res, 200, user);
})

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password)
      return next(new AppError(400, "Please provide email and password"));

    const user = await UserServices.login(email, password);

    if(user === null) {
        throw new AppError(501, "Unable to login please retry");
    }

    return sendToken(res, 200, "Logged in", user);
});

export const verifyUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {otp} = req.body;

    const user = await UserServices.verifyUser(otp);

    return sendResponse(res, 200, user);
});

export const changePassword = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const {oldPassword, newPassword} = req.body

    if(!oldPassword || !newPassword) 
        return  next(new AppError(400, "Please Enter Old Password and New Password"))

    const user = await UserServices.changePassword(req.user._id, oldPassword, newPassword);

    if(user === null) {
        return  next(new AppError(501, "Unable to change password please retry"));
    }

    return sendResponse(res, 200, user);
});

export const forgotPassword = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const {email} = req.body;

    const user = await UserServices.forgotPassword(email);

    if(user === null) {
        throw new AppError(501, "Unable to change password please retry");
    }

    return sendResponse(res, 200, user);    
});

export const resetPassword = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const {otp, password} = req.body

    if(!password) 
        return  next(new AppError(400, "Please enter password"))

    const user = await UserServices.resetPassword(otp, password);

    if(user === null) {
        return  next(new AppError(501, "Unable to change password please retry"));
    }

    return sendResponse(res, 200, user);
})