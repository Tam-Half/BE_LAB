import userService from "../services/User.Service";

const userController = {
    signup: async (req, res) => {
        try {
            const payload = req.body;
            const user = await userService.create(payload);
            res.status(201).json(user);

        } catch (error) {
            console.log("Lỗi khi tạo tài khoản", error)

        }
    }
}

export default userController;