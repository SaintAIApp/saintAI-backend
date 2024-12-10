import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth";
import { addFile, deleteFile, getAllFiles, getChatHistory, getChatHistoryTrade, getFile, sendChat, sendChatTrade, summarizeArticle, uploadFile } from "../controllers/upload";
import { multerUpload } from "../config/multerUpload";
// import { isFeatureAllowed } from "../middlewares/featureLimit";
// import { isSubscribed } from "../middlewares/payment";

const router = Router();

router.post("/", isAuthenticated, multerUpload.single("file"), addFile);
router.get("/:uploadId", isAuthenticated, getFile);
router.get("/", isAuthenticated, getAllFiles);
router.put("/:uploadId", isAuthenticated, multerUpload.single("file"), uploadFile);
router.delete("/:uploadId", isAuthenticated, deleteFile);

router.post("/send-message/:uploadId", isAuthenticated, sendChat);
router.post("/summarize-article", isAuthenticated, summarizeArticle);
router.get("/get-chat-history/:uploadId", isAuthenticated, getChatHistory);

router.post("/get_chat_history_trade_data", isAuthenticated, getChatHistoryTrade);
router.post("/chat_with_trade_data", isAuthenticated, sendChatTrade);

export default router;