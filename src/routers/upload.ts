import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth";
import { addFile, deleteFile, getAllFiles, getChatHistory, getFile, sendChat, uploadFile } from "../controllers/upload";
import { multerUpload } from "../config/multerUpload";
import { isFeatureAllowed } from "../middlewares/featureLimit";
import { isSubscribed } from "../middlewares/payment";

const router = Router();

router.post("/", isAuthenticated, isSubscribed, multerUpload.single("file"), isFeatureAllowed, addFile);
router.get("/:uploadId", isAuthenticated, getFile);
router.get("/", isAuthenticated, getAllFiles);
router.put("/:uploadId", isAuthenticated, multerUpload.single("file"), uploadFile);
router.delete("/:uploadId", isAuthenticated, deleteFile);

router.post("/send-message/:uploadId", isAuthenticated, sendChat);
router.get("/get-chat-history/:uploadId", isAuthenticated, getChatHistory);

export default router;