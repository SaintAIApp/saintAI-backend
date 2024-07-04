import { deleteObject, getObjectURL, putObjectURL } from "../aws/s3";
import { IUser } from "../models/user";
import Uploads, { IUpload } from "../models/uploads";
import { ObjectId } from "mongoose";
import AppError from "../utils/AppError";
import UserFeatureUsage from "../models/userFeatureUsage";
import axios from "axios";

class UploadService {
    async addFile(file: Express.Multer.File, user: IUser, name?: string): Promise<IUpload> {

        if(name === undefined) {
            name = file.originalname;
        }

        const fileKey = await putObjectURL(file, name);
        const fileUrl =  await getObjectURL(fileKey);
        
        let agentId;
        try {
            const url = process.env.AI_SERVER_URL + "/create_agent"
            
            const response = await axios.post(url, {
                data_files: [fileUrl],
                agent_name: name,
                user_id: user._id,
            });
            console.log(response.data);

            if(response.status != 200) {
                console.log(response.data.msg);
                throw new AppError(404, response.data.msg);
            }

            agentId = response.data.agent_id;
        } catch (err: any) {
            console.log(err.response.data);
            throw new AppError(err.response.data.status, err.response.data.msg);
        }

        const upload = await Uploads.create({
            userId: user._id,
            name: name,
            fileKey: fileKey,
            agentId: agentId
        });

        upload.fileUrl = fileUrl;
        
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
        const userUploadUsage = await UserFeatureUsage.findOne({userId,featureId:"uploadDoc"});
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

    async sendMessage(message: string, uploadId: string) {
        const url = process.env.AI_SERVER_URL + "/chat";

        const upload = await Uploads.findById(uploadId);
        console.log("url "+ uploadId);
        

        if(!upload) {
            throw new AppError(404, "File not found");
        }
        let assistantResponse;

        console.log(upload.agentId);
        

        try {
            const response = await axios.post(url, {
                user_msg: message,
                agent_id: upload.agentId
            });
    
            if(response.status !== 200) {
                throw new AppError(500, "Error while fetching response");
            }

            assistantResponse = response.data.assistant_response
        } catch(err: any) {
            throw new AppError(500, err.response.data.msg);
        }

        return assistantResponse;
    }

    async getChatHistory(uploadId: string) {
        const url = process.env.AI_SERVER_URL + "/get_chat_history";

        const upload = await Uploads.findById(uploadId);

        if(!upload) {
            throw new AppError(404, "File not found");
        }
        let chatHistory;

        try {
            const response = await axios.post(url, {
                agent_id: upload.agentId
            });
    
            if(response.status !== 200) {
                throw new AppError(500, "Error while fetching response");
            }

            chatHistory = response.data.history
        } catch(err: any) {
            throw new AppError(500, err.response.data.msg);
        }

        return chatHistory;
    }
}

export default new UploadService();