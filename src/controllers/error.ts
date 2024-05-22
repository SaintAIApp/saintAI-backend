import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import { MongoServerError } from "mongodb";
import { Error } from "mongoose";

// TODO: Need to handle error types:
// Handle CastError:
const handleCastErrorDB = (err: Error.CastError) => {
  const message = `Invalid value ${JSON.stringify(err.value)} for field ${
    err.path
  }`;
  return new AppError(400, message);
};
// Handle Duplicate Fields:
const handleDuplicateFieldsDB = (err: MongoServerError) => {
  const [key, value] = Object.entries(err.keyValue)[0];
  const message = `Value '${value}' already exists for field '${key}'`;
  return new AppError(400, message);
};
// Handle Validation Errors:
const handleValidationErrorDB = (err: Error.ValidationError) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data: ${errors.join(". ")}`;
  return new AppError(400, message);
};

// Dev Error:
const sendErrDev = (err: any, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
  });
};

// Prod Error:
const sendErrProd = (err: any, res: Response) => {
  if (err.isOperational) {
    // Operational error:
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Internal server error:
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};
// Global Error Handler:
const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Global Error Handler");
  console.log(error);

  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrDev(error, res);
  } else if (process.env.NODE_ENV === "production") {
    // Handle CastError:
    if (error.name === "CastError") {
      error = handleCastErrorDB(error);
    }

    // Handle Duplicate Fields:
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }

    // Handle Validation Errors:
    if (error.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    }

    sendErrProd(error, res);
  }
};

export default globalErrorHandler;