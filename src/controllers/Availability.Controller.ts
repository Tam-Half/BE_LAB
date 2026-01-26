import { Request, Response } from "express";
import AvailabilityService from "../services/Availability.Service";

const AvailabilityController = {
    search: async (req: Request, res: Response) => {
        try {
            const { checkIn, checkOut, adultCount, childCount, childAges, rooms } = req.body;

            if (!checkIn || !checkOut) {
                return res.status(400).json({
                    message: "Missing required fields: checkIn and checkOut."
                });
            }

            const result = await AvailabilityService.search({
                checkIn,
                checkOut,
                adultCount,
                childCount,
                childAges,
                rooms
            });

            return res.status(200).json(result);
        } catch (error: any) {
            console.error("Availability Search Error:", error);
            return res.status(500).json({
                message: error.message || "An error occurred during availability search."
            });
        }
    }
};

export default AvailabilityController;
