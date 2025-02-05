import { Schema, model, Document } from 'mongoose';

// Define the interface for the document
interface IPlan extends Document {
  tier: string;
  name: string;
  codename: string;
  price: number;
  priceCurrency: string;
  upgradeBurnNote: string | null;
  properties: string[];
}

// Define the schema
const PlanSchema = new Schema<IPlan>({
  tier: { type: String, required: true },
  name: { type: String, required: true },
  codename: { type: String, required: true },
  price: { type: Number, required: true },
  priceCurrency: { type: String, required: true },
  upgradeBurnNote: { type: String, default: null },
  properties: { type: [String], required: true },
});

// Create and export the model
const Plans = model<IPlan>('Plan', PlanSchema);
export default Plans;