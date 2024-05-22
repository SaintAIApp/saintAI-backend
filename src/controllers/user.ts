import { Request, Response, NextFunction } from "express";
import { catchAsync, sendResponse, sendToken } from "../utils/api.util";
import AppError from "../utils/AppError";
import UserServices from '../services/user'

export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {username, email, password } = req.body;

    if(!username || !email || !password) {
        return next(new AppError(404, "Please provide Username, Email and Password"));
    }

    const user = await UserServices.signup(username, email, password);

    return sendResponse(res, 200, user);
})

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;

    if (!username || !password)
      return next(new AppError(400, "Please provide username and password"));

    const user = await UserServices.login(username, password);

    if(user === null) {
        throw new AppError(501, "Unable to login please retry");
    }

    return sendToken(res, 200, "Logged in", user);
})