import { Router } from "express";
import chatController from "../controllers/Chat.Controller";
import { authentification } from "../middleware/auth.middleware";

const router = Router();

// Endpoint: POST /api/chat
// Yêu cầu xác thực người dùng (token) để lấy sessionId (user_id)
router.post("/", authentification, chatController.sendMessage);

export default router;
