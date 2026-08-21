import { Router } from "express";
const router = Router();
import authController from "../controllers/Auth.Controller";

router.post("/", authController.login);
router.post("/refresh-token", authController.refreshToken);
export default router;
