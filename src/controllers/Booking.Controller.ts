import { Request, Response } from "express";
import bookingService from "../services/Booking.Service";

const bookingController = {
    create: async (req: Request, res: Response) => {
        try {
            const booking = await bookingService.create(req.body);
            res.status(201).json({ message: "Booking created successfully", data: booking });
        } catch (error) {
            console.error("Error creating booking:", error);
            res.status(500).json({ message: error.message || "Error creating booking" });
        }
    },

    getAll: async (req: Request, res: Response) => {
        try {
            const bookings = await bookingService.getAll();
            res.status(200).json(bookings);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            res.status(500).json({ message: "Error fetching bookings" });
        }
    },

    getById: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string);
            const booking = await bookingService.getById(id);
            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }
            res.status(200).json(booking);
        } catch (error) {
            console.error("Error fetching booking:", error);
            res.status(500).json({ message: "Error fetching booking" });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string);
            const booking = await bookingService.update(id, req.body);
            res.status(200).json({ message: "Booking updated successfully", data: booking });
        } catch (error) {
            console.error("Error updating booking:", error);
            res.status(500).json({ message: error.message || "Error updating booking" });
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string);
            await bookingService.delete(id);
            res.status(200).json({ message: "Booking deleted successfully" });
        } catch (error) {
            console.error("Error deleting booking:", error);
            res.status(500).json({ message: "Error deleting booking" });
        }
    }
};

export default bookingController;
