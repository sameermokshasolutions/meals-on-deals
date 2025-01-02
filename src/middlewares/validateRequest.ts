import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware to validate incoming request data.
 * If validation errors exist, it sends a 400 response with the errors.
 * If no errors exist, it calls the next middleware in the stack.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function.
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Request validation faild ');

        res.status(400).json({ errors: errors.array() });
    }
    console.log('validation request passed ');

    next(); // If no errors, continue to the next middleware
};
