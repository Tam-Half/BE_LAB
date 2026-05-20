import { Request, Response } from "express";
import AvailabilityService from "../services/Availability.Service";

const AvailabilityController = {
    search: async (req: Request, res: Response) => {
        try {
            const { checkIn, checkOut, rooms } = req.body;

            if (!checkIn || !checkOut) {
                return res.status(400).json({
                    message: "Missing required fields: checkIn and checkOut."
                });
            }

            const result = await AvailabilityService.search({
                checkIn,
                checkOut,
                rooms
            });

            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Availability Search Error:", error);
            return res.status(500).json({
                message: error.message || "An error occurred during availability search."
            });
        }
    },

    getAvailableRooms: async (req: Request, res: Response) => {
        try {
            const { roomTypeId, checkIn, checkOut } = req.body;

            if (!roomTypeId || !checkIn || !checkOut) {
                return res.status(400).json({
                    message: "Missing required fields: roomTypeId, checkIn, and checkOut."
                });
            }

            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                return res.status(400).json({ message: "Invalid date format." });
            }

            const rooms = await AvailabilityService.findAvailableRooms(
                Number(roomTypeId),
                checkInDate,
                checkOutDate,
                100
            );

            return res.status(200).json({ data: rooms });
        } catch (error: any) {
            console.error("Get Available Rooms Error:", error);
            return res.status(500).json({
                message: error.message || "An error occurred during available rooms search."
            });
        }
    }
};

export default AvailabilityController;
