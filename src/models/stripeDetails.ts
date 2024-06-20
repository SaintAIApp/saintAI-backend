import mongoose, { ObjectId, Schema, model } from "mongoose";

export interface IStripeDetails extends Document {
    userId: ObjectId;
    customerId: string;
    subscriptionId: string;
}

const stripeDetailsSchema = new Schema<IStripeDetails>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    customerId: {
        type: String,
        required: true,
    },
    subscriptionId: {
        type: String,
        required: true,
    }
});

const StripeDetails = model<IStripeDetails>("StripeDetails", stripeDetailsSchema);

export default StripeDetails; 