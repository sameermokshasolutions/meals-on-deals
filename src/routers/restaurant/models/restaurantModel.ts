import mongoose, { Schema, Document } from 'mongoose';

export interface restaurant extends Document {
    restaurantName: string;
    email: string;
    address: string;
    password: string;
    contact: string;
    barcodeId: number;
    createdBy: mongoose.Types.ObjectId; // Reference to the user who created the restaurant
    role: string;
    logoUrl?: string;
    active: boolean;
}


const restaurantSchema: Schema = new Schema(
    {
        restaurantName: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true },
        address: { type: String, required: true, trim: true },
        password: { type: String, required: true, trim: true },
        logoUrl: { type: String, default: '' },
        contact: { type: String, required: true, unique: true, trim: true },
        barcodeId: { type: Number, required: true, unique: true },
        role: { type: String, default: 'restaurantAdmin' },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to user
        active: { type: Boolean, default: true }
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

export default mongoose.model<restaurant>('restaurant', restaurantSchema);
