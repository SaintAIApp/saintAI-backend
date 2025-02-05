import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth";
import { list } from "../controllers/plan";

const router = Router();

router.get("/", isAuthenticated, list);

export default router;