import { IUser } from "../models/user";
import UserFeatureUsage from "../models/userFeatureUsage";
import GroupFeatureLimit from "../models/groupFeatureLimits";
import AppError from "./AppError";
import mongoose from "mongoose";

export const incrementFeatureUsageCount = async (user: IUser, featureId: string) => {
    //console.log("FeatureId:", featureId);
    const userFeatureUsage = await UserFeatureUsage.findOne({userId: user._id, featureId: featureId});
    if(!userFeatureUsage) {
        
        const newUserFeatureUsage = await UserFeatureUsage.create({
            userId: user._id,
            featureId: featureId,
            usage: 1,
        })
        await newUserFeatureUsage.save();
        return;
    }
    
    userFeatureUsage.usage += 1;
    await userFeatureUsage.save();
};

export const isAllowed = async (user: IUser, featureId: string) => {

    if(!featureId) {
        throw new AppError(404, "Error featureID is not defined");
    }

    const userFeatureUsage = await UserFeatureUsage.findOne({userId: user._id, featureId: featureId});
    console.log("userFeatureUsage: "+userFeatureUsage);
    if(!userFeatureUsage) {
        const newUserFeatureUsage = await UserFeatureUsage.create({
            userId: user._id,
            featureId: featureId,
            usage: 0,
        })
        await newUserFeatureUsage.save();
        return true;
    }
    console.log("FeatureID: ", featureId);
    console.log("GroupID: ", user.groupId);
    
    const groupFeatureLimit = await GroupFeatureLimit.findOne({groupId: user.groupId, featureId: featureId});
    console.log("groupFeatureLimit: "+ groupFeatureLimit);
    
    if(!groupFeatureLimit) {
        throw new AppError(404, "User Group feature limit not found");
    }

    return userFeatureUsage.usage < groupFeatureLimit.value;
};