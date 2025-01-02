import mongoose, { Document, Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface IUsedCoupon {
  couponId: ObjectId;
  usedDate: Date;
}

export interface IRestaurantUsage {
  restaurantId: ObjectId;
  usedCoupons: IUsedCoupon[];
}

export interface IUserConsumption extends Document {
  userId: ObjectId;
  restaurants: ObjectId[];
  usedCoupons: IRestaurantUsage[];
}

const UsedCouponSchema = new Schema<IUsedCoupon>({
  couponId: { type: Schema.Types.ObjectId, required: true },
  usedDate: { type: Date, required: true },
});

const RestaurantUsageSchema = new Schema<IRestaurantUsage>({
  restaurantId: { type: Schema.Types.ObjectId, required: true },
  usedCoupons: [UsedCouponSchema],
});

const UserConsumptionSchema = new Schema<IUserConsumption>({
  userId: { type: Schema.Types.ObjectId, required: true },
  restaurants: [{ type: Schema.Types.ObjectId, ref: 'Restaurant' }],
  usedCoupons: [RestaurantUsageSchema],
});

const UserConsumption = mongoose.model<IUserConsumption>('UserConsumption', UserConsumptionSchema);

export default UserConsumption;