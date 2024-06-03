import mongoose, { ObjectId, Schema, model } from "mongoose";

export interface IOrders extends Document {
    user: ObjectId;
    amount: number;
    mode: string;

}

const ordersSchema = new Schema<IOrders>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    mode: {
        type: String,
        enum: ["STRIPE", "CRYPTO"],
        default: "STRIPE",
    }
})
