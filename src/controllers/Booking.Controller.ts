import { Request, Response } from "express";
import bookingService from "../services/Booking.Service";
import { BookingFilter } from "../interfaces/Booking";

const bookingController = {
    create: async (req: Request, res: Response) => {
        try {
            // Lấy userId từ JWT thông qua middleware authentification
            const userId = req["currentUser"]?.id;
            const payload = { ...req.body, user_id: userId || req.body.user_id };

            const booking = await bookingService.create(payload);
            res.status(201).json({ message: "Booking created successfully", data: booking });
        } catch (error) {
            console.error("Error creating booking:", error);
            res.status(500).json({ message: error.message || "Error creating booking" });
        }
    },

    getAll: async (req: Request, res: Response) => {
        try {
            // Lấy các tham số từ URL query: /bookings?status=PENDING&user_id=5
            const { status, user_id, hotel_id } = req.query;

            // Đóng gói thành object filter
            const filters: BookingFilter = {
                status: status as string,
                user_id: user_id ? Number(user_id) : undefined,
                hotel_id: hotel_id ? Number(hotel_id) : undefined,
            };

            const bookings = await bookingService.getAll(filters);

            res.status(200).json(bookings);
        } catch (error: any) {
            console.error("Error fetching bookings:", error);
            res.status(500).json({
                message: "Error fetching bookings",
                error: error.message
            });
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
