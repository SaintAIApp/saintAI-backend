import mongoose from "mongoose";

export const mongoConnect = async (uri: string) => {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB connection failed", error);
    return Promise.reject(error);
  }
};