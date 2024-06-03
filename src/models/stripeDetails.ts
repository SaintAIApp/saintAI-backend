import mongoose, { ObjectId, Schema, model } from "mongoose";

export interface IStripeDetails extends Document {
    userId: ObjectId;
    plan: string;
    validUntil: Date;
    customerId: string;
}

const stripeDetailsSchema = new Schema<IStripeDetails>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    plan: {
        type: String,
        enum: ["pro", "proPlus"],
        required: true,
    },
    validUntil: {
        type: Date,
        required: true,
    },
    customerId: {
        type: String,
        required: true,
    }
});

const StripeDetails = model<IStripeDetails>("StripeDetails", stripeDetailsSchema);

export default StripeDetails; 