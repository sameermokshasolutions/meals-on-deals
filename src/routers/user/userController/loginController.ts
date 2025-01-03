import restaurantModel, { restaurant } from './../../restaurant/models/restaurantModel';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

import { config } from '../../../config/config';
import usermodal from '../userModals/usermodal';

// Controller function to handle user login
export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Extract email and password from the request body
        const { email, password } = req.body;
        console.log(req.body);

        // Check if a user with the provided email exists in the database
        let existingUser = await usermodal.findOne({ email });
        if (!existingUser) {
            // If user not found, pass a 404 error to the error handler
            existingUser = await restaurantModel.findOne({ email: email });
        }
        if (!existingUser) {
            // If user not found, pass a 404 error to the error handler
            // existingUser = await restaurantModel.findOne({ email: email });
            return next(createHttpError(404, 'User not found'));
        }

        // Compare provided password with stored hashed password
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            // If password is incorrect, pass a 403 error to the error handler
            return next(createHttpError(403, 'Wrong password'));
        }

        // Generate a JWT token for the authenticated user with a 10-hour expiration
        const token = jwt.sign({ id: existingUser._id }, config.jwtSecret, { expiresIn: '10h' });

        // Set the token as an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict',
            maxAge: 10 * 60 * 60 * 1000 // 10 hours
        });

        // Send a success response with user information (excluding the token)
        res.status(200).json({
            success: true,
            role: existingUser.role,
            email: existingUser.email,
            userId: existingUser._id,
            message: 'Login successful',
        });
    } catch (error) {
        // Pass any errors to the next middleware for centralized error handling
        next(error);
    }
};

export const restaurentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {


        // Extract email and password from the request body
        const { email, password } = req.body;

        // Check if a user with the provided email exists in the database
        const existingUser = await restaurantModel.findOne({ email: email });
        if (!existingUser) {
            // If user not found, pass a 404 error to the error handler
            return next(createHttpError(404, 'User not found'));
        }

        // Compare provided password with stored hashed password
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            // If password is incorrect, pass a 403 error to the error handler
            return next(createHttpError(403, 'Wrong password'));
        }

        // Generate a JWT token for the authenticated user with a 10-hour expiration
        const token = jwt.sign({ id: existingUser._id }, config.jwtSecret, { expiresIn: '10h' });

        // Set the token as an HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict',
            maxAge: 10 * 60 * 60 * 1000 // 10 hours
        });

        // Send a success response with user information (excluding the token)
        res.status(200).json({
            success: true,
            role: 'restaurent',
            name: existingUser.restaurantName,
            email: existingUser.email,
            userId: existingUser._id,
            message: 'Login successful',
        });
    } catch (error) {
        // Pass any errors to the next middleware for centralized error handling
        next(error);
    }
};

// Controller function to handle user logout
export const logoutUser = (req: Request, res: Response): void => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.status(200).json({ message: 'Logged out successfully' });
};
// export const getRestaurent = (req: Request, res: Response): void => {
//     // get userCoupens
//     const userId = req.user?.id
//     const { id } = req.params; // restaurentId


// };
//


// Delete user account [COMPLETELY]
// TODO: soft remove
export const deleteUser = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;
        const cookieUserId = req.user?.id;

        // Check if a user with the provided email exists in the database


        // Compare provided password with stored hashed password


        const userData = await usermodal.findOne({ email });
        if (!userData) {
            return next(createHttpError(403, 'Invalid email or password! '));
        }
        const isMatch = await bcrypt.compare(password, userData.password);
        if (!isMatch) {
            return next(createHttpError(403, 'Invalid email or password! '));
        }
        const deletedUser = await usermodal.deleteOne({ _id: userData._id });

        console.log('[DELETE]', deletedUser);

        // Send a success response with user information (excluding the token)
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully',
        });
    } catch (error) {
        // Pass any errors to the next middleware for centralized error handling
        next(error);
    }
};
