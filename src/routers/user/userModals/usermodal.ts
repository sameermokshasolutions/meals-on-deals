import { restaurant } from './../../restaurant/models/restaurantModel';
import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface IUser extends Document {
  userId: number;
  role: 'user' | 'superuser' | 'restaurant';
  userName: string;
  email: string;
  password: string;
  contactNumber?: string;
  restaurantId?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema = new Schema(
  {
    userId: { type: Number, required: true, unique: true },
    role: { type: String, enum: ['user', 'superuser', 'restaurant'], default: 'user' },
    userName: { type: String, required: true },
    email: { type: String, required: true, match: /^\S+@\S+\.\S+$/ },
    password: { type: String, required: true },
    contactNumber: { type: String, match: /^[0-9]{10,20}$/ },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', UserSchema);
