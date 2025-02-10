import { Schema, model, Document, ObjectId } from 'mongoose';

// Define the interface for the document
interface IPlan extends Document {
  _id:ObjectId;
  tier: number;
  name: string;
  codename: string;
  price: number;
  priceCurrency: string;
  upgradeBurnNote: string | null;
  properties: string[];
}

// Define the schema
const PlanSchema = new Schema<IPlan>({
  tier: { type: Number, required: true },
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