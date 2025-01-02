import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for the Activity document
export interface IActivity extends Document {
    userId: string;
    remarks: string;
    timestamp: Date;
    mutateTable: string;
    content: string;
    status: boolean;
    contentUrl?: string;
    fileSize?: string;
    fileFormat?: string;
}

// Define the Mongoose schema for the Activity model
const ActivitySchema: Schema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true // Add an index for faster queries
    },
    remarks: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true // Add an index for faster queries and sorting
    },
    mutateTable: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    contentUrl: {
        type: String
    },
    fileSize: {
        type: String
    },
    fileFormat: {
        type: String
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Create and export the Mongoose model
export const ActivityModel = mongoose.model<IActivity>('Activity', ActivitySchema);