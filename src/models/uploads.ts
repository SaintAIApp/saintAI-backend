import mongoose, {  ObjectId, Schema, model } from "mongoose";

export interface IUpload extends Document {
    userId: ObjectId;
    name: string;
    fileKey: string;
    fileUrl: string;
    agentId: string;
}

const uploadSchema = new Schema<IUpload>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    fileKey: {
        type: String,
        required: true,
    },
    fileUrl: {
        type: String,
    },
    agentId: {
        type: String,
        required: true,
    }
},{timestamps:true});

uploadSchema.index({ userId: 1, name: 1 }, { unique: true });

const Upload = model<IUpload>("Upload", uploadSchema);

export default Upload; 