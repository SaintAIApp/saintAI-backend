import { deleteObject, getObjectURL, putObjectURL } from "../aws/s3";
import { IUser } from "../models/user";
import Uploads, { IUpload } from "../models/uploads";
import { ObjectId } from "mongoose";
import AppError from "../utils/AppError";

class UploadService {
    async addFile(file: Express.Multer.File, user: IUser, name?: string): Promise<IUpload> {

        if(name === undefined) {
            name = file.originalname;
        }

        const imageName = await putObjectURL(file, name);
        const upload = await Uploads.create({
            userId: user._id,
            name: name,
            fileKey: imageName
        });

        upload.fileUrl = await getObjectURL(imageName);
        
        return upload;
    }

    async getFile(uploadId: string): Promise<IUpload> {
        const upload = await Uploads.findById(uploadId);

        if(!upload) {
            throw new AppError(404, "File not found");
        }

        upload.fileUrl = await getObjectURL(upload.fileKey);

        return upload
    }

    async getAllFiles(userId: ObjectId): Promise<IUpload[]> {
        const uploads = await Uploads.find({userId: userId});

        uploads.map(async (upload) => {
            upload.fileUrl = await getObjectURL(upload.fileKey);
        });

        return uploads;
    }

    async updateFile(uploadId: string, file?: Express.Multer.File, name?: string): Promise<IUpload> {
        const upload = await Uploads.findById(uploadId);

        if(!upload) {
            throw new AppError(404, "File not found");
        }
        
        if(name !== undefined) {
            upload.name = name;
        }

        if(file) {
            const prevFileKey = upload.fileKey;
            name = name ? name : file.originalname;
            upload.fileKey = await putObjectURL(file, name);
            
            await deleteObject(prevFileKey);
        }
        
        await upload.save();
        upload.fileUrl = await getObjectURL(upload.fileKey);

        return upload;
    }

    async deleteFile(uploadId: string): Promise<IUpload> {
        const upload = await Uploads.findById(uploadId);

        if(!upload)
            throw new AppError(404, "File not found");

        await deleteObject(upload.fileKey);

        await upload.deleteOne();

        return upload;
    }
}

export default new UploadService();