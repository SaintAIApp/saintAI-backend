import mongoose, { ObjectId, Schema, model } from "mongoose";

export interface ICryptoDetails extends Document {
    userId: ObjectId;
    walletAddress: string;
    networkName: string;
    chainId: number
}

const cryptoDetailsSchema = new Schema<ICryptoDetails>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    walletAddress: {
        type: String,
        required: true
    },
    networkName: {
        type: String,
        enum: ["SOLANA", "ETHEREUM"],
        required: true,
    },
    chainId: {
        type: Number,
        required: true,
    },
});

const CryptoDetails = model<ICryptoDetails>("CryptoDetails", cryptoDetailsSchema);

export default CryptoDetails; 