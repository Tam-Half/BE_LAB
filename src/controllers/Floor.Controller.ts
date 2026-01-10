import floorService from "../services/Floor.Service";

const floorController = {
    create: async (req, res) => {
        try {
            const payload = req.body;
            const newFloor = await floorService.create(payload);
            res.status(201).json({ message: "Tạo tầng thành công", data: newFloor });
        } catch (error) {
            console.log("Lỗi khi tạo tầng", error);
            res.status(500).json({ message: "Lỗi khi tạo tầng", error: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const payload = req.body;
            await floorService.update(id, payload);
            res.status(200).json({ message: "Cập nhật tầng thành công" });
        } catch (error) {
            console.log("Lỗi khi cập nhật tầng", error);
            res.status(500).json({ message: "Lỗi khi cập nhật tầng", error: error.message });
        }
    },
    delete: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            await floorService.delete(id);
            res.status(200).json({ message: "Xóa tầng thành công" });
        } catch (error) {
            console.log("Lỗi khi xóa tầng", error);
            res.status(500).json({ message: "Lỗi khi xóa tầng", error: error.message });
        }
    }
}

export default floorController;
