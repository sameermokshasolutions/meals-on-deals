import mongoose, { Schema, Document, Types } from "mongoose";

interface IRestaurantUsers extends Document {
    restaurantId: Types.ObjectId; // Reference to the restaurant
    users: Types.ObjectId[]; // Array of user IDs
}

const RestaurantUsersSchema: Schema = new Schema({
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: "Restaurant", // Assuming there is a Restaurant model
        required: true,
    },
    users: [
        {
            type: Schema.Types.ObjectId,
            ref: "User", // Assuming there is a User model
            required: true,
        },
    ],
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
});

export default mongoose.model<IRestaurantUsers>("RestaurantUsers", RestaurantUsersSchema);
