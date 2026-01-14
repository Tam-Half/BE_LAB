import roomTypeService from "../services/RoomType.Service";

const roomTypeController = {
    create: async (req, res) => {
        try {
            const payload = req.body;
            const roomType = await roomTypeService.create(payload);
            res.status(201).json({ message: "Tạo loại phòng thành công", data: roomType });
        } catch (error) {
            console.log("Lỗi khi tạo loại phòng", error);
            res.status(500).json({ message: "Lỗi khi tạo loại phòng", error: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const payload = req.body;
            await roomTypeService.update(id, payload);
            res.status(200).json({ message: "Cập nhật loại phòng thành công" });
        } catch (error) {
            console.log("Lỗi khi cập nhật loại phòng", error);
            res.status(500).json({ message: error.message });
        }
    },
    delete: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            await roomTypeService.delete(id);
            res.status(200).json({ message: "Xóa loại phòng thành công" });
        } catch (error) {
            console.log("Lỗi khi xóa loại phòng", error);
            res.status(500).json({ message: "Lỗi khi xóa loại phòng", error: error.message });
        }
    },
    getAll: async (req, res) => {
        try {
            const roomTypes = await roomTypeService.getAll();
            res.status(200).json({ data: roomTypes });
        } catch (error) {
            console.log("Lỗi khi lấy danh sách loại phòng", error);
            res.status(500).json({ message: "Lỗi khi lấy danh sách loại phòng", error: error.message });
        }
    }
}

export default roomTypeController;
