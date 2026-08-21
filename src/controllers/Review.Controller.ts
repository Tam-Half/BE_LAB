import { Request, Response } from "express";
import reviewService from "../services/Review.Service";

const reviewController = {
    create: async (req: Request, res: Response) => {
        try {
            const { booking_id, room_type_id, rating, comment } = req.body;
            const currentUser = (req as any).currentUser; // Updated to match middleware

            if (!currentUser) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const review = await reviewService.createReview({
                booking_id,
                room_type_id,
                rating: Number(rating),
                comment,
                user_id: currentUser.id
            });

            res.status(201).json({
                message: "Đánh giá của bạn đã được gửi thành công",
                data: review
            });
        } catch (error) {
            console.error("Lỗi khi tạo đánh giá:", error);
            res.status(400).json({ message: error.message });
        }
    },

    toggleVisibility: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string);
            const { is_hidden } = req.body;
            const currentUser = (req as any).currentUser;

            const review = await reviewService.toggleVisibility(id, is_hidden, currentUser);

            res.status(200).json({
                message: is_hidden ? "Đã ẩn đánh giá" : "Đã hiện đánh giá",
                data: review
            });
        } catch (error) {
            console.error("Lỗi khi thay đổi trạng thái đánh giá:", error);
            res.status(403).json({ message: error.message });
        }
    },

    getByRoomType: async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id as string);
            const reviews = await reviewService.getReviewsByRoomType(id);
            res.status(200).json({ data: reviews });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đánh giá:", error);
            res.status(500).json({ message: error.message });
        }
    }
};

export default reviewController;
