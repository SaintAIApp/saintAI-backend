import { Schema, model, ObjectId, Document } from "mongoose";

export interface IGroup extends Document {
    _id:ObjectId;
    name: string;
    price: number;
}

const groupSchema = new Schema<IGroup>({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    price: {
        type: Number,
        required: true,
    },
});

const Group = model<IGroup>("Group", groupSchema);
export default Group; 