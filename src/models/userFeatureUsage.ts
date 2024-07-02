import {Schema, ObjectId, model, Document} from "mongoose"

interface IUserFeatureUsage extends Document {
    userId: ObjectId;
    featureId: String;
    usage: number;
}

const userFeatureUsageSchema = new Schema<IUserFeatureUsage>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    featureId: {
        type: String,
        unique: true,
        required: true,
    },
    usage: {
        type: Number,
        required: true,
    }
});

const UserFeatureUsage = model<IUserFeatureUsage>("UserFeatureUsage", userFeatureUsageSchema);

export default UserFeatureUsage;