import express, { Router } from "express";
import { crypto, news, stocks, getSolPrice } from "../controllers/finance";

const router = Router();

router.get("/stocks", stocks);
router.get("/crypto", crypto);
router.get("/news", news);
router.get("/sol-price", getSolPrice);

export default router;
