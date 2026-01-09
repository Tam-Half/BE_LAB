import authService from "../services/Auth.Service";

const authController = {
    login: async (req, res) => {
        try {
            const payload = req.body;
            console.log(payload)
            const result = await authService.login(payload);
            return res.status(200).json(result);
        } catch (error) {
            console.log("Lỗi khi đăng nhập", error);
            return res.status(500).json({ message: "Lỗi khi đăng nhập", error: error.message });
        }
    }
}
export default authController;