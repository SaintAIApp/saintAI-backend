import mongoose, { ObjectId, Schema, model } from "mongoose";

export interface IPaymentDetails extends Document {
    userId: ObjectId;
    plan: string;
    validUntil: Date;
    paymentMode: string;
}

const paymentDetailsSchema = new Schema<IPaymentDetails>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    validUntil: {
        type: Date,
        required: true,
    },
    paymentMode: {
        type: String,
        enum: ["STRIPE", "CRYPTO"],
        required: true,
    },
    plan:{
        type: String,
        required:true
    }
});

const PaymentDetails = model<IPaymentDetails>("PaymentDetails", paymentDetailsSchema);

export default PaymentDetails; 