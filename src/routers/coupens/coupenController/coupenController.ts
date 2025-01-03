import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import couponModel from '../models/couponModel';


export const createCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { couponTitle, discount, restaurantId } = req.body;
        // Get the latest coupon number
        const lastCoupon = await couponModel.findOne().sort({ couponNumber: -1 });
        const nextCouponNumber = lastCoupon ? lastCoupon.couponNumber + 1 : 1;
        const coupon = new couponModel({
            couponNumber: nextCouponNumber,
            couponTitle,
            discount,
            restaurantId
        });
        await coupon.save();
        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            data: coupon,
        });
    } catch (error) {
        next(error);
    }
};

export const getCoupons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { restaurantId, search } = req.query;


        const query: any = {};
        if (restaurantId) query.restaurantId = restaurantId;
        if (search) query.couponTitle = new RegExp(search as string, 'i');

        const coupons = await couponModel.find(query);
        res.status(200).json({
            success: true,
            data: coupons,
        });
    } catch (error) {
        console.log(error);

        next(error);
    }
};

export const updateCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { couponId } = req.params;
        const { couponTitle, discount } = req.body;
        const updatedCoupon = await couponModel.findByIdAndUpdate(
            couponId,
            { couponTitle, discount },
            { new: true, runValidators: true }
        );
        if (!updatedCoupon) {
            throw createHttpError(404, 'Coupon not found');
        }
        res.status(200).json({
            success: true,
            message: 'Coupon updated successfully',
            data: updatedCoupon,
        });
    } catch (error) {
        next(error);
    }
};

export const activateCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { couponId } = req.params;
        const activatedCoupon = await couponModel.findByIdAndUpdate(
            couponId,
            { active: true },
            { new: true }
        );
        if (!activatedCoupon) {
            throw createHttpError(404, 'Coupon not found');
        }
        res.status(200).json({
            success: true,
            message: 'Coupon activated successfully',
            data: activatedCoupon,
        });
    } catch (error) {
        next(error);
    }
};

export const deactivateCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { couponId } = req.params;
        const deactivatedCoupon = await couponModel.findByIdAndUpdate(
            couponId,
            { active: false },
            { new: true }
        );
        if (!deactivatedCoupon) {
            throw createHttpError(404, 'Coupon not found');
        }
        res.status(200).json({
            success: true,
            message: 'Coupon deactivated successfully',
            data: deactivatedCoupon,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCoupon = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { couponId } = req.params;
        const deletedCoupon = await couponModel.findByIdAndDelete(couponId);
        if (!deletedCoupon) {
            throw createHttpError(404, 'Coupon not found');
        }
        res.status(200).json({
            success: true,
            message: 'Coupon deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

