import roomService from "../services/Room.Service";

const roomController = {
    create: async (req, res) => {
        try {
            const payload = req.body;
            const room = await roomService.create(payload);
            res.status(201).json({ message: "Tạo phòng thành công", data: room });
        } catch (error) {
            console.log("Lỗi khi tạo phòng", error);
            res.status(500).json({ message: "Lỗi khi tạo phòng", error: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const payload = req.body;
            const room = await roomService.update(id, payload);
            res.status(200).json({ message: "Cập nhật phòng thành công", data: room });
        } catch (error) {
            console.log("Lỗi khi cập nhật phòng", error);
            res.status(500).json({ message: "Lỗi khi cập nhật phòng", error: error.message });
        }
    },
    delete: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            await roomService.delete(id);
            res.status(200).json({ message: "Xóa phòng thành công" });
        } catch (error) {
            console.log("Lỗi khi xóa phòng", error);
            res.status(500).json({ message: "Lỗi khi xóa phòng", error: error.message });
        }
    },
    getAll: async (req, res) => {
        try {
            const rooms = await roomService.getAll();
            res.status(200).json({ data: rooms });
        } catch (error) {
            console.log("Lỗi khi lấy danh sách phòng", error);
            res.status(500).json({ message: "Lỗi khi lấy danh sách phòng", error: error.message });
        }
    },

    getRoomTimeline: async (req, res) => {
        try {
            const roomId = Number(req.params.id);
            const data = await roomService.getRoomDetailTimeline(roomId);
            res.status(200).json(data);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    },

}

export default roomController;
