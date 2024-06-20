import { IUser } from "../models/user";
import UserFeatureUsage from "../models/userFeatureUsage";
import GroupFeatureLimit from "../models/groupFeatureLimits";
import AppError from "./AppError";

export const incrementUploadCount = async (user: IUser, featureId: string) => {
    const userFeatureUsage = await UserFeatureUsage.findOne({userId: user._id, featureId: featureId});
    if(!userFeatureUsage) {
        throw new AppError(404, "User not found");
    }
    
    userFeatureUsage.usage += 1;
    await userFeatureUsage.save();
};

export const isAllowed = async (user: IUser, featureId: string) => {
    const userFeatureUsage = await UserFeatureUsage.findOne({userId: user._id, featureId: featureId});
    console.log(userFeatureUsage);
    if(!userFeatureUsage) {
        throw new AppError(404, "User not found");
    }
    
    const groupFeatureLimit = await GroupFeatureLimit.findOne({groupId: user.groupId, featureId: featureId});
    if(!groupFeatureLimit) {
        throw new AppError(404, "User not found");
    }

    return userFeatureUsage.usage < groupFeatureLimit.value;
};