import { ErrorRequestHandler } from "express";
import { HttpError } from "http-errors";
import { config } from "../config/config";

const globalErrorHandler: ErrorRequestHandler = (
    err: HttpError,
    _req,
    res,
    _next
) => {
    const statusCode = err.statusCode || 500;
    console.log("----------------------------->>", err);

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Something went wrong',
        errorStack: config.env === 'development' ? err.stack : ''
    });
    // Don't return the response object
};

export default globalErrorHandler;