import { Schema, model } from "mongoose";

export interface IFinanceData extends Document {
    symbol: string;
    data: Record<string, any>;
    type: string;
}

const financeDataSchema = new Schema<IFinanceData>({
    symbol: {
        type: String,
        required: true,
    },
    data: {
        type: Schema.Types.Mixed,
        required: true,
    },
    type: {
        type: String,
        enum: ["STOCK", "CRYPTO"],
        required: true,
    },
});

const FinanceData = model<IFinanceData>("FinanceData", financeDataSchema);

export default FinanceData;