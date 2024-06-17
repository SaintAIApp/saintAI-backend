import { Schema, model } from "mongoose";

export interface IFeature extends Document {
    featureId: string;
    name: string;
}

const featureSchema = new Schema<IFeature>({
    featureId: {
        type: String,
        unique: true,
        required: true,
    },
    name: {
        type: String,
        required: true
    }
});

const Feature = model<IFeature>("Feature", featureSchema);
export default Feature; 