import roomTypeService from "../services/RoomType.Service";
import { uploadToCloudinary } from "../middleware/upload";

const roomTypeController = {
    create: async (req, res) => {
        try {
            const payload = req.body;
            const files = req.files as Express.Multer.File[];

            let uploadedImages = [];
            if (files && files.length > 0) {
                const uploadPromises = files.map(file => uploadToCloudinary(file, "DoraHotel/RoomType"));
                const results = await Promise.all(uploadPromises);
                uploadedImages = results.map((result: any) => ({
                    url: result.secure_url,
                    public_id: result.public_id
                }));
            }

            const roomType = await roomTypeService.create(payload, uploadedImages);
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
    },
    getById: async (req, res) => {
        try {
            const id = parseInt(req.params.id as string);
            const { checkIn, checkOut } = req.query as any;
            const roomType = await roomTypeService.getById(id, checkIn, checkOut);
            res.status(200).json({ data: roomType });
        } catch (error) {
            console.log("Lỗi khi lấy thông tin loại phòng", error);
            res.status(500).json({ message: error.message });
        }
    }
}

export default roomTypeController;
