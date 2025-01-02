import express, { Request, Response, NextFunction } from 'express';
import restaurantModel from '../../restaurant/models/restaurantModel';
import createHttpError from 'http-errors';
import coupenModel from '../../coupens/models/couponModel';



// Controller function to handle report summary
export const summary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        console.log('-----------------------------------------');

        // Get the total count of restaurants and coupons
        const totalrestaurants = await restaurantModel.countDocuments();
        const totalCoupens = await coupenModel.countDocuments();
        console.log(totalrestaurants,
            totalCoupens,);

        // Send a success response with the totals
        res.status(200).json({
            success: true,
            totalrestaurants,
            totalCoupens,
        });
    } catch (error) {
        // Pass any errors to the next middleware for centralized error handling
        next(error);
    }
};


