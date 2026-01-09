import userService from "../services/User.Service";

const userController = {
    signup: async (req, res) => {
        try {
            const payload = req.body;
            const user = await userService.create(payload);
            res.status(201).json({ message: "Tạo tài khoản thành công" });

        } catch (error) {
            console.log("Lỗi khi tạo tài khoản", error)
            res.status(500).json({ message: "Lỗi khi tạo tài khoản" });
        }
    }
}

export default userController;