import { Request, Response } from "express";
import RoomClassService from "../services/RoomClass.Service";

const RoomClassController = {
    create: async (req: Request, res: Response) => {
        try {
            const result = await RoomClassService.create(req.body);
            return res.status(201).json(result);
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await RoomClassService.update(parseInt(id as string), req.body);
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await RoomClassService.delete(parseInt(id as string));
            return res.status(204).send();
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    },

    getAll: async (req: Request, res: Response) => {
        try {
            const result = await RoomClassService.getAll();
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    },

    getById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await RoomClassService.getById(parseInt(id as string));
            if (!result) return res.status(404).json({ message: "Không tìm thấy hạng phòng" });
            return res.status(200).json(result);
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    }
};

export default RoomClassController;
