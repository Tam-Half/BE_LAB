import { Request, Response } from "express";
import extraServiceService from "../services/ExtraService.Service";

const extraServiceController = {
    create: async (req: Request, res: Response) => {
        try {
            const payload = req.body;
            const data = await extraServiceService.create(payload);
            res.status(201).json({ message: "Tạo dịch vụ thành công", data });
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi tạo dịch vụ", error: error.message });
        }
    },
    update: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string);
            const payload = req.body;
            await extraServiceService.update(id, payload);
            res.status(200).json({ message: "Cập nhật dịch vụ thành công" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    delete: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string);
            await extraServiceService.delete(id);
            res.status(200).json({ message: "Xóa dịch vụ thành công" });
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi xóa dịch vụ", error: error.message });
        }
    },
    getAll: async (req: Request, res: Response) => {
        try {
            const data = await extraServiceService.getAll();
            res.status(200).json({ data });
        } catch (error) {
            res.status(500).json({ message: "Lỗi khi lấy danh sách dịch vụ", error: error.message });
        }
    },
    getById: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string);
            const data = await extraServiceService.getById(id);
            res.status(200).json({ data });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default extraServiceController;
