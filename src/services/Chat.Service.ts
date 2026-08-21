import dotenv from "dotenv";

dotenv.config();

const ChatService = {
    sendMessageToAI: async (sessionId: string, message: string) => {
        const webhookUrl = process.env.N8N_WEBHOOK_URL;
        if (!webhookUrl) {
            throw new Error("N8N_WEBHOOK_URL is not defined in environment variables");
        }

        try {
            // Sử dụng native fetch thay vì axios để không cần cài thêm package ở backend
            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sessionId: sessionId,
                    chatInput: message
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error: any) {
            console.error("Error communicating with n8n Webhook:", error.message);
            throw new Error("Failed to get response from AI Chatbot");
        }
    }
};

export default ChatService;
