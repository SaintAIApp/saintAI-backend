import {Schema, ObjectId, model, Document} from "mongoose"

interface IUserFeatureUsage extends Document {
    userId: ObjectId;
    featureId: ObjectId;
    usage: number;
}

const userFeatureUsageSchema = new Schema<IUserFeatureUsage>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    featureId: {
        type: Schema.Types.ObjectId,
        ref: "Feature",
        required: true,
    },
    usage: {
        type: Number,
        required: true,
    }
});

const UserFeatureUsage = model<IUserFeatureUsage>("UserFeatureUsage", userFeatureUsageSchema);

export default UserFeatureUsage;