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
            // Lấy userId từ JWT thông qua middleware authentification
            const currentUserId = req["currentUser"]?.id;

            // Lấy các tham số từ URL query
            const { status, user_id, hotel_id, booking_code } = req.query;

            // Kiểm tra quyền: 
            // - Nếu là USER: Chỉ xem được booking của chính mình
            // - Nếu là STAFF/ADMIN: Xem được tất cả hoặc lọc theo user_id được truyền lên
            const currentUserRole = req["currentUser"]?.role;
            let targetUserId = user_id ? (user_id as string) : undefined;

            if (currentUserRole === "user") {
                targetUserId = currentUserId;
            }

            // Đóng gói thành object filter
            const filters: BookingFilter = {
                status: status as string,
                user_id: targetUserId as any,
                hotel_id: hotel_id ? Number(hotel_id) : undefined,
                booking_code: booking_code as string,
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
    },
    // Trong BookingController
    updateRoomStatus: async (req: Request, res: Response) => {
        try {
            const bookingId = parseInt(req.params.bookingId as string);
            const { allocationId, status } = req.body;

            if (!allocationId || !status) {
                return res.status(400).json({ error: "Thiếu allocationId hoặc status" });
            }

            const result = await bookingService.updateRoomStatus(bookingId, allocationId, status);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },
    cancel: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string);
            const currentUser = req["currentUser"];
            
            const result = await bookingService.cancel(id, currentUser);
            res.status(200).json(result);
        } catch (error: any) {
            console.error("Error cancelling booking:", error);
            const statusCode = error.message.includes("permission") ? 403 : 
                             error.message.includes("not found") ? 404 : 400;
            res.status(statusCode).json({ message: error.message || "Error cancelling booking" });
        }
    },

    checkout: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string);
            const result = await bookingService.checkout(id, req.body);
            res.status(200).json({ message: "Checkout completed successfully", data: result });
        } catch (error) {
            console.error("Error during checkout:", error);
            res.status(500).json({ message: error.message || "Error during checkout" });
        }
    },

    changeRoom: async (req: Request, res: Response) => {
        try {
            const bookingId = parseInt(req.params.id as string);
            const { allocationId, targetRoomId, recalculatePrice } = req.body;

            if (!allocationId || !targetRoomId) {
                return res.status(400).json({ error: "Thiếu allocationId hoặc targetRoomId" });
            }

            const result = await bookingService.changeRoom(bookingId, allocationId, targetRoomId, !!recalculatePrice);
            res.status(200).json(result);
        } catch (error: any) {
            console.error("Error during changeRoom:", error);
            res.status(400).json({ error: error.message || "Lỗi trong quá trình chuyển phòng" });
        }
    }

};

export default bookingController;
