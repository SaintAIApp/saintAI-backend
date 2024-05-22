import mongoose from "mongoose";

export const mongoConnect = async (uri: string) => {
  try {
    const { connection } = await mongoose.connect(uri, {
      dbName: "SaintAIDB",
    });
    console.log(`MongoDB connected to ${connection.host}`);
  } catch (error) {
    console.log("MongoDB connection failed", error);
    return Promise.reject(error);
  }
};