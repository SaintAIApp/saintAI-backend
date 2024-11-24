import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import { s3Client } from "../config/aws";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import AppError from "../utils/AppError";
  
export const getObjectURL = async (key: string) => {
    const command = new GetObjectCommand({
      Key: key,
      Bucket: process.env.BUCKET_NAME,
    });
    const url = await getSignedUrl(s3Client, command);
    return url;
};

export const putObjectURL = async (file: Express.Multer.File, name: string) => {
  
  const destination = `uploads/${name}`;

    try {
      const uploadParams = {
        Bucket: process.env.BUCKET_NAME,
        Body: file.buffer,
        Key: destination,
        ContentType: file.mimetype,
      };
      await s3Client.send(new PutObjectCommand(uploadParams));
      return destination;
    } catch (error: any) {
      throw new AppError(400, error);
    }
};
  
export const deleteObject = async (key: string) => {
    try {
      const command = new DeleteObjectCommand({
        Key: key,
        Bucket: process.env.BUCKET_NAME,
      });
      await s3Client.send(command);
    } catch (error: any) {
      throw new AppError(500, "Error deleting image");
    }
};