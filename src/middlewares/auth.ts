import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../utils/api.util";
import AppError from "../utils/AppError";
import User, { IUser } from "../models/user";

export interface CustomRequest extends Request {
  user: IUser;
}

export const isAuthenticated = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1] || "";
    if (!token) return next(new AppError(401, "Login to access"));

    const decodedData: any = jwt.verify(token, process.env.JWT_SECRET || "");

    if (decodedData.exp && Date.now() >= decodedData.exp * 1000) {
      return next(new AppError(401, "Token has expired"));
    }
    let userFound: IUser;
    userFound = (await User.findById(decodedData._id)) as IUser;
    if (!userFound) return next(new AppError(401, "User not found"));
    req.user = userFound;
    next();
  }
);