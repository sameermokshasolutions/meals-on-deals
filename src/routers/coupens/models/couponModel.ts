import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
    couponTitle: string;
    discount: number;
    active: boolean;
    couponNumber: number;
    restaurantId: mongoose.Types.ObjectId;
}

const couponSchema = new Schema({
    couponTitle: { type: String, required: true, trim: true },
    discount: { type: Number, required: true, min: 0, max: 100 },
    couponNumber: { type: Number, default: true },
    active: { type: Boolean, default: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
}, { timestamps: true });

export default mongoose.model<ICoupon>('Coupon', couponSchema);

