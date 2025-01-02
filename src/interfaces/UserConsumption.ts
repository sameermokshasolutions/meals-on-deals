import { ObjectId } from 'mongodb';

export interface UsedCoupon {
    couponId: ObjectId;
    usedDate: Date;
}

export interface RestaurantUsage {
    restaurantId: ObjectId;
    usedCoupons: UsedCoupon[];
}

export interface IUserConsumption {
    _id?: ObjectId;
    userId: ObjectId;
    restaurants: ObjectId[];
    usedCoupons: RestaurantUsage[];
}