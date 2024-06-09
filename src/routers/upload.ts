import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth";
import { addFile, deleteFile, getAllFiles, getFile, uploadFile } from "../controllers/upload";
import { multerUpload } from "../config/multerUpload";

const router = Router();

router.post("/", isAuthenticated, multerUpload.single("file"), addFile);
router.get("/:uploadId", isAuthenticated, getFile);
router.get("/", isAuthenticated, getAllFiles);
router.put("/:uploadId", isAuthenticated, multerUpload.single("file"), uploadFile);
router.delete("/:uploadId", isAuthenticated, deleteFile);

export default router;