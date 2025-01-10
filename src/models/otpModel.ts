import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string,
  createdAt: Date;
}

// OTP Schema
const OtpSchema = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // OTP expires after 5 minutes Time To Live (TTL)
  }
});

export default mongoose.model<IOtp>('OTP', OtpSchema);
