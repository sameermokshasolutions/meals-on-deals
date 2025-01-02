const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const coupenInfoSchema = new Schema({
    userId: { type: mongoose.Schema.types.ObjectId, ref: "User", required: true },
    coupenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupen', required: true },
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurant', required: true },
    date: { type: Date, required: true },
    billNo: { type: String, required: true },
    amount: { type: Number, required: false }
});





