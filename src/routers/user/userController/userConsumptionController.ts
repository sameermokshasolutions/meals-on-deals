import { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import mongoose, { Document } from 'mongoose';

import UserConsumption, { IUserConsumption } from '../userModals/UserConsumption';
import couponModel, { ICoupon } from '../../coupens/models/couponModel';
import restaurantModel from '../../restaurant/models/restaurantModel';
import createHttpError from 'http-errors';

export const getRestaurent = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userConsumption = await UserConsumption.findOne({ userId: new ObjectId(userId) });
    if (userConsumption && userConsumption.restaurants) {
      const restaurantIds = userConsumption.restaurants.map(id => new ObjectId(id));
      const restaurants = await restaurantModel.find({ _id: { $in: restaurantIds } }).select('restaurantName address contact active barcodeId');
      res.status(200).json({
        success: true,
        data: restaurants
      });
    } else {
      console.log('No restaurants found for this user.');
      res.status(200).json({ success: true, restaurants: [] });
    }
  } catch (err) {
    res.status(404).json({ message: 'Something went wrong' });
  }

}
export const getUserConsumptionData = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { barcodeId } = req.params;
    const restaurentData: any = await restaurantModel.findOne({ barcodeId: barcodeId });
    if (!restaurentData || restaurentData == null) {
      next(createHttpError({ status: 404, success: false, message: "Something went wrong " }))
    }
    const restaurantId = restaurentData._id
    if (!userId || !restaurantId) {
      res.status(400).json({ message: 'Missing userId or restaurantId' });
      return;
    }
    // Find or create user consumption data
    let userConsumption = await UserConsumption.findOne({ userId: new ObjectId(userId) });
    if (!userConsumption) {
      userConsumption = new UserConsumption({
        userId: new ObjectId(userId),
        restaurants: [new ObjectId(restaurantId)],
        usedCoupons: [],
      });
      await userConsumption.save();
    } else if (!userConsumption.restaurants.some(id => id.equals(new ObjectId(restaurantId)))) {
      userConsumption.restaurants.push(new ObjectId(restaurantId));
      await userConsumption.save();
    }
    // Get current month's used coupons
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const restaurantUsage = userConsumption.usedCoupons.find(
      (usage) => usage.restaurantId.equals(new ObjectId(restaurantId))
    );
    const usedCouponsThisMonth = restaurantUsage
      ? restaurantUsage.usedCoupons.filter((coupon) => coupon.usedDate >= firstDayOfMonth)
      : [];
    // Fetch all coupons for the current restaurant
    const allCoupons = await couponModel.find({ restaurantId: new ObjectId(restaurantId) });
    // Separate coupons into used and unused
    const usedCouponIds = new Set(usedCouponsThisMonth.map((coupon) => coupon.couponId.toString()));
    const usedCoupons = allCoupons.filter((coupon) => {
      const couponId = (coupon as Document<unknown, {}, ICoupon> & ICoupon)._id;
      return couponId && usedCouponIds.has(couponId.toString());
    });
    const unusedCoupons = allCoupons.filter((coupon) => {
      const couponId = (coupon as Document<unknown, {}, ICoupon> & ICoupon)._id;
      return couponId && !usedCouponIds.has(couponId.toString());
    });
    res.status(200).json({
      success: true,
      usedCoupons,
      unusedCoupons,
      restaurentData
    });
  } catch (error) {
    console.error('Error in getUserConsumptionData:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const redeemCoupen = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const restaurantId = req.user?.id;
    const { couponId, userId } = req.params;
    if (!userId || !couponId) {
      res.status(400).json({ message: 'Missing userId or couponId' });
      return;
    }
    if (!mongoose.isValidObjectId(couponId)) {
      res.status(400).json({ message: 'Invalid coupon ID' });
      return;
    }
    // check coupen is assosiated with the restaurant or not  
    const coupon = await couponModel.findById(couponId);
    if (!coupon) {
      res.status(404).json({ message: 'Coupon not found' });
      return;
    }
    if (!coupon.restaurantId.equals(new ObjectId(restaurantId))) {
      res.status(403).json({ message: 'Coupon not associated with this restaurant' });
      return;
    }
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    // Fetch user consumption data
    let userConsumption = await UserConsumption.findOne({ userId: new mongoose.Types.ObjectId(userId) });
    console.log(userConsumption);
    if (!userConsumption) {
      userConsumption = new UserConsumption({
        userId,
        restaurants: [],
        usedCoupons: [],
      });
      await userConsumption.save();
    }
    // Check if the coupon is already used this month
    const isCouponUsed = userConsumption.usedCoupons.some((restaurantUsage) =>
      restaurantUsage.usedCoupons.some((usedCoupon) => {
        console.log(usedCoupon.usedDate);
        const usedDate = new Date(usedCoupon.usedDate);
        return (
          usedCoupon.couponId.toString() === couponId &&
          usedDate.getMonth() === currentMonth &&
          usedDate.getFullYear() === currentYear
        );
      })
    );

    console.log('isCouponUsed:', isCouponUsed);

    if (isCouponUsed) {
      res.status(400).json({ message: 'Coupon already used this month' });
      return;
    }

    // Fetch the coupon details


    // Check if the restaurant exists in the user's usedCoupons
    const restaurantIndex = userConsumption.usedCoupons.findIndex(
      (usage) => usage.restaurantId.toString() === coupon.restaurantId.toString()
    );

    if (restaurantIndex > -1) {
      // Update the existing restaurant's usedCoupons
      userConsumption.usedCoupons[restaurantIndex].usedCoupons.push({
        couponId: new mongoose.Types.ObjectId(couponId),
        usedDate: currentDate,
      });
    } else {
      // Add a new restaurant entry to usedCoupons
      userConsumption.usedCoupons.push({
        restaurantId: coupon.restaurantId,
        usedCoupons: [
          {
            couponId: new mongoose.Types.ObjectId(couponId),
            usedDate: currentDate,
          },
        ],
      });
    }

    // Save the updated userConsumption
    const updatedUserConsumption = await userConsumption.save();
    console.log('updatedUserConsumption:', updatedUserConsumption);

    res.status(200).json({
      message: 'Coupon redeemed successfully',
      discountPercentage: coupon.discount,
      updatedUserConsumption,
    });
  } catch (error) {
    console.error('Error in redeemCoupen:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
