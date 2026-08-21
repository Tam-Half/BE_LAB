import authService from "../services/Auth.Service";

const authController = {
    login: async (req, res) => {
        try {
            const payload = req.body;
            const result = await authService.login(payload);
            return res.status(200).json(result);
        } catch (error) {
            console.log("Lỗi khi đăng nhập", error);
            return res.status(500).json({ message: "Lỗi khi đăng nhập", error: error.message });
        }
    },
    refreshToken: async (req, res) => {
        try {
            // Thường refresh token sẽ được gửi qua body hoặc cookie
            const { refresh_token } = req.body; 

            if (!refresh_token) {
                return res.status(401).json({ message: "Không tìm thấy Refresh Token" });
            }

            const result = await authService.refreshToken({ refresh_token });
            
            return res.status(200).json(result);
        } catch (error) {
            console.log("Lỗi khi refresh token:", error.message);
            return res.status(401).json({ message: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại", error: error.message });
        }
    }
}
export default authController;