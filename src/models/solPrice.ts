import { Schema, model, Document } from "mongoose";

export interface ISolPrice extends Document {
  timestamp: Date;
  priceUSD: number;
}

const solPriceSchema = new Schema<ISolPrice>({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  priceUSD: {
    type: Number,
    required: true,
  },
});

const SolPrice = model<ISolPrice>("SolPrice", solPriceSchema);

export default SolPrice;
