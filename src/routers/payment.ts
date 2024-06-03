import express, { Router } from "express";
import { createCheckout, onPayment } from "../controllers/payment";
import { isAuthenticated } from "../middlewares/auth";

const router = Router();

router.post("/webhook",express.raw({ type: 'application/json' }), onPayment);
router.post("/create-checkout", isAuthenticated, createCheckout);

export default router;