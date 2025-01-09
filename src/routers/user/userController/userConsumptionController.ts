import restaurantUsers from '../userModals/restaurentUsers';
import { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import mongoose, { Document } from 'mongoose';
import UserConsumption from '../userModals/UserConsumption';
import couponModel from '../../coupens/models/couponModel';
import restaurantModel from '../../restaurant/models/restaurantModel';
import createHttpError from 'http-errors';
interface IUserConsumption {
  userId: ObjectId;
  restaurants: ObjectId[];
  usedCoupons: Array<{
    restaurantId: ObjectId;
    usedCoupons: Array<{
      couponId: ObjectId;
      usedDate: Date;
    }>;
  }>;
}
interface ICoupon {
  _id: ObjectId;
  couponNumber: number;
  restaurantId: ObjectId;
}
export const getRestaurent = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userConsumption = await UserConsumption.findOne({ userId: new ObjectId(userId) });
    if (userConsumption && userConsumption.restaurants) {
      const restaurantIds = userConsumption.restaurants.map(id => new ObjectId(id));
      const restaurants = await restaurantModel.find({ _id: { $in: restaurantIds } }).select('restaurantName address contact active barcodeId logoUrl');
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

export const sssgetUserConsumptionData = async (req: any, res: Response, next: NextFunction): Promise<void> => {
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

    // Get the used coupon numbers for this month
    const usedCouponIds = new Set(usedCouponsThisMonth.map((coupon) => coupon.couponId.toString()));
    const usedCoupons = allCoupons.filter((coupon) => {
      const couponDoc = coupon as Document<unknown, {}, ICoupon> & ICoupon;
      return couponDoc._id && usedCouponIds.has(couponDoc._id.toString());
    });

    // Sort used coupons by couponNumber to find the sequence
    const usedCouponNumbers = usedCoupons
      .map(coupon => (coupon as any).couponNumber)
      .sort((a, b) => a - b);

    // Check if the used coupons form a sequential pattern (1,2,3)
    const isSequential = usedCouponNumbers.every((num, index) =>
      num === index + 1
    );

    // Determine which unused coupons can be used
    const unusedCoupons = allCoupons.filter((coupon) => {
      const couponDoc = coupon as Document<unknown, {}, ICoupon> & ICoupon;
      if (!couponDoc._id || usedCouponIds.has(couponDoc._id.toString())) {
        return false;
      }

      // If coupons 1,2,3 are used sequentially, then coupon 4 can be used
      if (isSequential && usedCouponNumbers.length > 0) {
        return couponDoc.couponNumber === usedCouponNumbers.length + 1;
      }

      // If the sequence is broken or no coupons used, only coupon 1 can be used
      return couponDoc.couponNumber === 1;
    }).map(coupon => {
      const couponDoc = coupon.toObject();
      return {
        ...couponDoc,
        canUse: true
      };
    });

    // Add remaining unused coupons with canUse = false
    const remainingUnusedCoupons = allCoupons.filter((coupon) => {
      const couponDoc = coupon as Document<unknown, {}, ICoupon> & ICoupon;
      return couponDoc._id &&
        !usedCouponIds.has(couponDoc._id.toString()) &&
        !unusedCoupons.some(uc => (uc as any)._id.toString() === couponDoc._id.toString());
    }).map(coupon => {
      const couponDoc = coupon.toObject();
      return {
        ...couponDoc,
        canUse: false
      };
    });

    // Combine all unused coupons
    const allUnusedCoupons = [...unusedCoupons, ...remainingUnusedCoupons]
      .sort((a, b) => a.couponNumber - b.couponNumber);

    res.status(200).json({
      success: true,
      usedCoupons,
      unusedCoupons: allUnusedCoupons,
      restaurentData
    });
  } catch (error) {
    console.error('Error in getUserConsumptionData:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
interface IRequest {
  user?: {
    id: string;
  };
  params: {
    barcodeId: string;
  };
}
interface ICouponDocument {
  _id: ObjectId;
  couponTitle: string;
  discount: number;
  couponNumber: number;
  active: boolean;
  restaurantId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface IRestaurantDocument {
  _id: ObjectId;
  restaurantName: string;
  address: string;
  contact: string;
  barcodeId: string;
  email: string;
  logoUrl: string;
  active: boolean;
}
export const getUserConsumptionData_old = async (
  req: IRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { barcodeId } = req.params;

    // Find restaurant data
    const restaurantData = await restaurantModel.findOne({ barcodeId }).lean() as IRestaurantDocument | null;
    if (!restaurantData) {
      next(createHttpError(404, "Restaurant not found"));
      return;
    }

    const restaurantId = restaurantData._id;
    if (!userId || !restaurantId) {
      res.status(400).json({ success: false, message: 'Missing userId or restaurantId' });
      return;
    }

    // Find or create user consumption data
    let userConsumption = await UserConsumption.findOne({
      userId: new ObjectId(userId)
    });

    if (!userConsumption) {
      const newUserConsumption = new UserConsumption({
        userId: new ObjectId(userId),
        restaurants: [restaurantId],
        usedCoupons: [],
      });
      userConsumption = await newUserConsumption.save();
    } else if (!userConsumption.restaurants.some(id => id.toString() === restaurantId.toString())) {
      userConsumption.restaurants.push(restaurantId);
      await userConsumption.save();
    }

    // Get current month's used coupons
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const restaurantUsage = userConsumption.usedCoupons.find(
      (usage) => usage.restaurantId.toString() === restaurantId.toString()
    );

    const usedCouponsThisMonth = restaurantUsage
      ? restaurantUsage.usedCoupons.filter((coupon) => coupon.usedDate >= firstDayOfMonth)
      : [];

    // Fetch all coupons and convert to plain objects
    const allCoupons = await couponModel
      .find({ restaurantId })
      .sort({ couponNumber: 1 })
      .lean() as any[];

    // Get used coupon numbers for this month
    const usedCouponNumbers = new Set(
      usedCouponsThisMonth.map((usedCoupon) => {
        const coupon = allCoupons.find(c => c._id.toString() === usedCoupon.couponId.toString());
        return coupon?.couponNumber;
      }).filter((num): num is number => num !== undefined)
    );

    // Find the highest used coupon number
    const highestUsedNumber = Math.max(...Array.from(usedCouponNumbers), 0);

    // Process and clean coupon data
    const { usedCoupons, unusedCoupons } = allCoupons.reduce<{
      usedCoupons: Array<ICouponDocument & { canUse: boolean }>;
      unusedCoupons: Array<ICouponDocument & { canUse: boolean }>;
    }>((acc, coupon) => {
      const cleanCoupon = {
        _id: coupon._id,
        couponTitle: coupon.couponTitle,
        discount: coupon.discount,
        couponNumber: coupon.couponNumber,
        active: coupon.active,
        restaurantId: coupon.restaurantId,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      };

      if (usedCouponNumbers.has(coupon.couponNumber)) {
        acc.usedCoupons.push({
          ...cleanCoupon,
          canUse: true
        });
      } else {
        const canUse = coupon.couponNumber === highestUsedNumber + 1;
        acc.unusedCoupons.push({
          ...cleanCoupon,
          canUse
        });
      }
      return acc;
    }, { usedCoupons: [], unusedCoupons: [] });

    // Clean restaurant data
    const cleanRestaurantData = {
      _id: restaurantData._id,
      restaurantName: restaurantData.restaurantName,
      address: restaurantData.address,
      contact: restaurantData.contact,
      barcodeId: restaurantData.barcodeId,
      email: restaurantData.email,
      logoUrl: restaurantData.logoUrl,
      active: restaurantData.active
    };

    res.status(200).json({
      success: true,
      usedCoupons,
      unusedCoupons,
      restaurantData: cleanRestaurantData
    });

  } catch (error) {
    console.error('Error in getUserConsumptionData:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
export const getUserConsumptionData = async (
  req: IRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { barcodeId } = req.params;

    // Find restaurant data
    const restaurantData = await restaurantModel.findOne({ barcodeId }).lean() as IRestaurantDocument | null;
    if (!restaurantData) {
      next(createHttpError(404, "Restaurant not found"));
      return;
    }

    const restaurantId = restaurantData._id;
    if (!userId || !restaurantId) {
      res.status(400).json({ success: false, message: 'Missing userId or restaurantId' });
      return;
    }

    // Find or create user consumption data
    let userConsumption = await UserConsumption.findOne({
      userId: new ObjectId(userId)
    });

    if (!userConsumption) {
      const newUserConsumption = new UserConsumption({
        userId: new ObjectId(userId),
        restaurants: [restaurantId],
        usedCoupons: [],
      });
      userConsumption = await newUserConsumption.save();
    } else if (!userConsumption.restaurants.some(id => id.toString() === restaurantId.toString())) {
      userConsumption.restaurants.push(restaurantId);
      await userConsumption.save();
    }

    // Handle RestaurantUsers relationship
    let restaurentAssociatedUsers = await restaurantUsers.findOne({ restaurantId });

    if (!restaurentAssociatedUsers) {
      // If restaurant doesn't exist in RestaurantUsers, create new entry
      restaurentAssociatedUsers = new restaurantUsers({
        restaurantId,
        users: [userId]
      });
      await restaurentAssociatedUsers.save();
    } else {
      // Check if user exists in the users array
      const userExists = restaurentAssociatedUsers.users.some(
        id => id.toString() === userId.toString()
      );

      if (!userExists) {
        // Add user to the array if they don't exist
        restaurentAssociatedUsers.users.push(new ObjectId(userId));
        await restaurentAssociatedUsers.save();
      }
    }

    // Get current month's used coupons
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const restaurantUsage = userConsumption.usedCoupons.find(
      (usage) => usage.restaurantId.toString() === restaurantId.toString()
    );

    const usedCouponsThisMonth = restaurantUsage
      ? restaurantUsage.usedCoupons.filter((coupon) => coupon.usedDate >= firstDayOfMonth)
      : [];

    // Fetch all coupons and convert to plain objects
    const allCoupons = await couponModel
      .find({ restaurantId })
      .sort({ couponNumber: 1 })
      .lean() as any[];

    // Get used coupon numbers for this month
    const usedCouponNumbers = new Set(
      usedCouponsThisMonth.map((usedCoupon) => {
        const coupon = allCoupons.find(c => c._id.toString() === usedCoupon.couponId.toString());
        return coupon?.couponNumber;
      }).filter((num): num is number => num !== undefined)
    );

    // Find the highest used coupon number
    const highestUsedNumber = Math.max(...Array.from(usedCouponNumbers), 0);

    // Process and clean coupon data
    const { usedCoupons, unusedCoupons } = allCoupons.reduce<{
      usedCoupons: Array<ICouponDocument & { canUse: boolean }>;
      unusedCoupons: Array<ICouponDocument & { canUse: boolean }>;
    }>((acc, coupon) => {
      const cleanCoupon = {
        _id: coupon._id,
        couponTitle: coupon.couponTitle,
        discount: coupon.discount,
        couponNumber: coupon.couponNumber,
        active: coupon.active,
        restaurantId: coupon.restaurantId,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      };

      if (usedCouponNumbers.has(coupon.couponNumber)) {
        acc.usedCoupons.push({
          ...cleanCoupon,
          canUse: true
        });
      } else {
        const canUse = coupon.couponNumber === highestUsedNumber + 1;
        acc.unusedCoupons.push({
          ...cleanCoupon,
          canUse
        });
      }
      return acc;
    }, { usedCoupons: [], unusedCoupons: [] });

    // Clean restaurant data
    const cleanRestaurantData = {
      _id: restaurantData._id,
      restaurantName: restaurantData.restaurantName,
      address: restaurantData.address,
      contact: restaurantData.contact,
      barcodeId: restaurantData.barcodeId,
      email: restaurantData.email,
      logoUrl: restaurantData.logoUrl,
      active: restaurantData.active
    };

    res.status(200).json({
      success: true,
      usedCoupons,
      unusedCoupons,
      restaurantData: cleanRestaurantData
    });

  } catch (error) {
    console.error('Error in getUserConsumptionData:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
import { io } from '../../../config/socket';

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
    console.log('userId:', userId);
    io.sockets.in(userId).emit('restaurant-update', {
      success: true,
      message: "Coupon reedeemd successfully"
    });
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
