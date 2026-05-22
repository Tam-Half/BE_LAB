import userService from "../services/User.Service";

const userController = {
    signup: async (req, res) => {
        try {
            const payload = req.body;
            await userService.create(payload);
            res.status(201).json({ message: "Tạo tài khoản thành công" });

        } catch (error) {
            console.log("Lỗi khi tạo tài khoản", error)
            res.status(500).json({ message: "Lỗi khi tạo tài khoản" });
        }
    },
    getProfile: async (req, res) => {
        try {
            const userId = req.currentUser.id;
            const user = await userService.getProfile(userId);
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy người dùng" });
            }
            res.status(200).json(user);
        } catch (error) {
            console.log("Lỗi khi lấy thông tin người dùng", error)
            res.status(500).json({ message: "Lỗi hệ thống" });
        }
    },
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            await userService.forgotPassword(email);
            res.status(200).json({ message: "Yêu cầu đã được ghi nhận. Vui lòng kiểm tra email (giả lập)" });
        } catch (error) {
            console.log("Lỗi quên mật khẩu", error)
            res.status(400).json({ message: error.message || "Lỗi khi thực hiện yêu cầu" });
        }
    },
    resetPassword: async (req, res) => {
        try {
            const { email, newPassword } = req.body;
            await userService.resetPassword(email, newPassword);
            res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
        } catch (error) {
            console.log("Lỗi đặt lại mật khẩu", error)
            res.status(400).json({ message: error.message || "Lỗi khi thực hiện yêu cầu" });
        }
    },
    getAccountsForAdmin: async (req, res) => {
        try {
            const accounts = await userService.getAccountsForAdmin();
            res.status(200).json(accounts);
        } catch (error) {
            console.log("Lỗi lấy danh sách tài khoản cho Admin", error);
            res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách tài khoản" });
        }
    },
    updateAccountByAdmin: async (req, res) => {
        try {
            const { id } = req.params;
            const payload = req.body;
            await userService.updateAccountByAdmin(id, payload);
            res.status(200).json({ message: "Cập nhật thông tin tài khoản thành công" });
        } catch (error) {
            console.log("Lỗi cập nhật tài khoản Admin", error);
            res.status(400).json({ message: error.message || "Lỗi khi cập nhật tài khoản" });
        }
    },
    resetPasswordByAdmin: async (req, res) => {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;
            await userService.resetPasswordByAdmin(id, newPassword);
            res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
        } catch (error) {
            console.log("Lỗi đặt lại mật khẩu của Admin", error);
            res.status(400).json({ message: error.message || "Lỗi khi đặt lại mật khẩu" });
        }
    }
}

export default userController;