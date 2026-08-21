import { Request, Response } from "express";
import shiftService from "../services/Shift.Service";

const shiftController = {
    getAllShifts: async (req: Request, res: Response) => {
        try {
            const data = await shiftService.getAllShifts();
            return res.status(200).json({
                message: "Lấy danh sách ca làm việc thành công",
                data: data
            });
        } catch (error: any) {
            console.error("Lỗi khi lấy danh sách ca trực:", error);
            return res.status(500).json({
                message: error.message || "Lỗi server khi lấy danh sách ca làm việc"
            });
        }
    },
    // API: POST /start
    startShift: async (req: Request, res: Response) => {
        try {
            // req.body chứa { staffId, initialCash }
            const result = await shiftService.startShift(req.body);
            return res.status(200).json({ message: "Mở ca thành công", data: result });
        } catch (error: any) {
            console.log("Lỗi mở ca:", error);
            return res.status(500).json({ message: error.message });
        }
    },

    // API: GET /:id/stats
    getStats: async (req: Request, res: Response) => {
        try {
            const shiftId = Number(req.params.id);
            const result = await shiftService.getShiftReport(shiftId);
            return res.status(200).json({ data: result });
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    },

    // API: POST /:id/end
    endShift: async (req: Request, res: Response) => {
        try {
            const shiftId = Number(req.params.id);
            const { actualCash, note } = req.body;

            // Gom lại thành 1 payload để gửi sang service
            const result = await shiftService.endShift({ shiftId, actualCash, note });

            return res.status(200).json({ message: "Chốt ca thành công", data: result });
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    },
    getCurrentShift: async (req: Request, res: Response) => {
        try {
            const staffId = req.query.staffId as string;
            if (!staffId) {
                return res.status(400).json({ message: "Thiếu staffId" });
            }

            const result = await shiftService.getCurrentShiftByStaff(staffId);

            // Nếu không tìm thấy (result là null), vẫn trả về 200 nhưng data null
            // Để frontend biết là "chưa mở ca"
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    },
}

export default shiftController;