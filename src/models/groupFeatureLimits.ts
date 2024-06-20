import { Schema, model, ObjectId } from "mongoose";

export interface IGroupFeatureLimit extends Document {
    groupId: ObjectId;
    featureId: ObjectId;
    value: any;
}

const groupFeatureLimitSchema = new Schema<IGroupFeatureLimit>({
    groupId: {
        type: Schema.Types.ObjectId,
        ref: "Group",
        required: true,
    },
    featureId: {
        type: Schema.Types.ObjectId,
        ref: "Feature",
        required: true,
    },
    value: {
        type: Schema.Types.Mixed,
        required: true
    }
});

const GroupFeatureLimit = model<IGroupFeatureLimit>("GroupFeatureLimit", groupFeatureLimitSchema);
export default GroupFeatureLimit; 