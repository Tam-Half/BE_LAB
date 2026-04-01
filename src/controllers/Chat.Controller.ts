import { Request, Response } from "express";
import ChatService from "../services/Chat.Service";

const chatController = {
    sendMessage: async (req: Request, res: Response) => {
        try {
            // Lấy ID người dùng từ JWT Token qua middleware
            const userId = req["currentUser"]?.id;
            const { message } = req.body;

            if (!message) {
                return res.status(400).json({ message: "Message content is required" });
            }

            // Gửi message lên n8n Webhook, kèm userId làm sessionId để phân nhóm memory
            const aiResponse = await ChatService.sendMessageToAI(String(userId), message);

            // Trả về kết quả cho Frontend
            res.status(200).json(aiResponse);
        } catch (error: any) {
            res.status(500).json({ message: "Error communicating with Chatbot API", error: error.message });
        }
    }
};

export default chatController;
