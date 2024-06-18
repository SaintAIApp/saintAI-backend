import { Router } from "express";
import { changePassword, forgotPassword, login, resetPassword, signup, verifyUser,deleteAccount, signinWithCrypto } from "../controllers/user";
import { isAuthenticated } from "../middlewares/auth";

const router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/crypto-signin", signinWithCrypto);
router.post("/verify-user", verifyUser);
router.post("/change-password", isAuthenticated, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/delete-account/:userId",deleteAccount)

export default router;