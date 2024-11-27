import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/user";

// Purpose: Express middleware to catch async errors.
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);
};

export const sendResponse = (res: Response, statusCode: number, data: any) => {
  res.status(statusCode).json({
    status: "success",
    data,
  });
};

export const sendToken = (
  res: Response,
  statusCode: number,
  message: string,
  user: IUser
) => {
  const token = user.generateToken();
  res.status(statusCode).json({
    success: true,
    message: message,
    user,
    token,
  });
};