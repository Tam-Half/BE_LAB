import { Router } from "express";
import userController from "../controllers/User.Controller";
import { authentification } from "../middleware/auth.middleware";

const router = Router();

router.post("/", userController.signup);
router.get("/profile", authentification, userController.getProfile);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

export default router;