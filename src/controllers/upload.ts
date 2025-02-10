import { NextFunction, Request, Response } from "express"
import { CustomRequest } from "../middlewares/auth"
import { catchAsync, sendResponse } from "../utils/api.util"
import AppError from "../utils/AppError";
import UploadService from '../services/upload';
import { incrementFeatureUsageCount } from "../utils/checkLimits";
import MiningServices from '../services/mining'
const allowedFileTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/csv'];


export const addFile = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    
    if (!req.file) {
        return next(new AppError(400, "Please provide the file"));
    }

    if (!allowedFileTypes.includes(req.file.mimetype)) {
        return next(new AppError(400, "Invalid file type. Only .pdf, .docx, and .csv files are allowed."));
    }

    const {name} = req.body;

    const file = await UploadService.addFile(req.file, req.user, name);
    
    //await incrementFeatureUsageCount(req.user, req.body.featureId)
    
    return sendResponse(res, 201, file);
});

export const getFile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uploadId} = req.params;

    const file = await UploadService.getFile(uploadId);

    return sendResponse(res, 200, file);
});

export const getAllFiles = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userId = req.user._id;

    const uploads = await UploadService.getAllFiles(userId);

    return sendResponse(res, 200, uploads);
})

export const uploadFile = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const {name} = req.body;
    const {uploadId} = req.params;

    if (req.file && !allowedFileTypes.includes(req.file.mimetype)) {
        return next(new AppError(400, "Invalid file type. Only .pdf, .docx, and .csv files are allowed."));
    }

    const updatedFile = await UploadService.updateFile(uploadId, req.file, name);

    return sendResponse(res, 200, updatedFile);
});

export const deleteFile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uploadId} = req.params;

    const file = await UploadService.deleteFile(uploadId);

    return sendResponse(res, 200, file);
});

export const sendChat = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const {message} = req.body;
    const {uploadId} = req.params;
    const userId = req.user._id.toString();
    if(!message || !uploadId) {
        return next(new AppError(400, "Please enter a message and uploadId"));
    }

    const start = Date.now();
    const assistantResponse = await UploadService.sendMessage(message, uploadId);
    const end = Date.now();
    const timeTaken = end - start;
    await MiningServices.createOrUpdate(userId,message,timeTaken,assistantResponse)
    return sendResponse(res, 200, assistantResponse);
});

export const updateMining = catchAsync(async (req: CustomRequest, res: Response, next:NextFunction) => {
    const userId = req.user._id.toString();
    const {timeTaken} = req.body
    await MiningServices.createOrUpdate(userId,"this game centipede",timeTaken,"this game")
    return sendResponse(res, 200,"");
})
export const summarizeArticle = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const {url} = req.body;
    const userId = req.user._id.toString();
    if(!url ) {
        return next(new AppError(400, "Please enter a url"));
    }

    const start = Date.now();
    const assistantResponse = await UploadService.summarizeArticle(url);
    const end = Date.now();
    const timeTaken = end - start;
    await MiningServices.createOrUpdate(userId,url,timeTaken,assistantResponse)
    return sendResponse(res, 200, assistantResponse);
});

export const getChatHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {uploadId} = req.params;

    if(!uploadId) {
        return next(new AppError(400, "Please enter a message and uploadId"));
    }

    const chatHistory = await UploadService.getChatHistory(uploadId);

    return sendResponse(res, 200, chatHistory);
});

export const sendChatTrade = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {user_msg,user_id} = req.body;
    if(!user_msg || !user_id) {
        return next(new AppError(400, "Please enter a message and userId"));
    }
    const start = Date.now();
    const assistantResponse = await UploadService.sendMessageTrade(user_msg,user_id);

    const end = Date.now();
    const timeTaken = end - start; 

    await MiningServices.createOrUpdate(user_id,user_msg,timeTaken,assistantResponse)
    
    return sendResponse(res, 200, assistantResponse);
});

export const generateGame = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {user_msg,user_id} = req.body;
    if(!user_msg || !user_id) {
        return next(new AppError(400, "Please enter a message and userId"));
    }
    const start = Date.now();
    const assistantResponse = await UploadService.sendGenerateGame(user_msg,user_id);

    const end = Date.now();
    const timeTaken = end - start; 

    await MiningServices.createOrUpdate(user_id,user_msg,timeTaken,assistantResponse)
    
    return sendResponse(res, 200, assistantResponse);
});

export const getChatHistoryTrade = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const {user_id} = req.body;
    if(!user_id) {
        return next(new AppError(400, "Please enter the userId"));
    }

    const chatHistory = await UploadService.getChatHistoryTrade(user_id);

    return sendResponse(res, 200, chatHistory);
});