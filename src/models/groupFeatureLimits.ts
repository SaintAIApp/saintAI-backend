import { Schema, model, ObjectId } from "mongoose";

export interface IGroupFeatureLimit extends Document {
    groupId: ObjectId;
    featureId: string;
    value: any;
}

const groupFeatureLimitSchema = new Schema<IGroupFeatureLimit>({
    groupId: {
        type: Schema.Types.ObjectId,
        ref: "Group",
        required: true,
    },
    featureId: {
        type: "string",
        required: true,
    },
    value: {
        type: Schema.Types.Mixed,
        required: true
    }
});

const GroupFeatureLimit = model<IGroupFeatureLimit>("GroupFeatureLimit", groupFeatureLimitSchema);
export default GroupFeatureLimit; 