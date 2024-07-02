import express, { Router } from "express";
import { crypto, news, stocks } from "../controllers/finance";

const router = Router();

router.get("/stocks", stocks);
router.get("/crypto", crypto);
router.get("/news", news);

export default router;
