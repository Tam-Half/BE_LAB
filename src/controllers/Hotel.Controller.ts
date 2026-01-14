import hotelService from "../services/Hotel.service";

const hotelController = {
    create: async (req, res) => {
        try {
            const payload = req.body;
            const hotel = await hotelService.create(payload);
            res.status(201).json({ message: "Tạo khách sạn thành công", data: hotel });
        } catch (error) {
            console.log("Lỗi khi tạo khách sạn", error);
            res.status(500).json({ message: "Lỗi khi tạo khách sạn", error: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const payload = req.body;
            const hotel = await hotelService.update(id, payload);
            res.status(200).json(hotel);
        } catch (error) {
            console.log("Lỗi khi cập nhật khách sạn", error);
            res.status(500).json({ message: error.message });
        }
    },
    delete: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            await hotelService.delete(id);
            res.status(200).json({ message: "Xóa khách sạn thành công" });
        } catch (error) {
            console.log("Lỗi khi xóa khách sạn", error);
            res.status(500).json({ message: "Lỗi khi xóa khách sạn", error: error.message });
        }
    }
}
export default hotelController