import { AppDataSource } from "../data-source";
import { Review } from "../dto/Review";
import { RoomType } from "../dto/RoomType";
import { Booking } from "../dto/Booking";
import { BookingStatus, UserRole } from "../dto/Enums";

const reviewRepository = AppDataSource.getRepository(Review);
const roomTypeRepository = AppDataSource.getRepository(RoomType);
const bookingRepository = AppDataSource.getRepository(Booking);

const reviewService = {
    createReview: async (payload: {
        booking_id: number,
        room_type_id: number,
        rating: number,
        comment?: string,
        user_id: string
    }) => {
        const { booking_id, room_type_id, rating, comment, user_id } = payload;

        // 1. Core Validations
        if (rating < 1 || rating > 5) {
            throw new Error("Rating must be between 1 and 5 stars");
        }

        const booking = await bookingRepository.findOne({
            where: { id: booking_id },
            relations: ["user", "bookingDetails", "bookingDetails.roomType"]
        });

        if (!booking) throw new Error("Booking not found");

        if (booking.user.id !== user_id) {
            throw new Error("You can only review your own bookings");
        }

        // if ((booking.status !== BookingStatus.COMPLETED)) {
        //     throw new Error("You can only review a completed booking");
        // }

        const roomType = await roomTypeRepository.findOneBy({ id: room_type_id });
        if (!roomType) throw new Error("Room type not found");

        // Verify that the booking actually contains this room type
        const hasRoomType = booking.bookingDetails.some(bd => bd.roomType.id === room_type_id);
        if (!hasRoomType) {
            throw new Error("This booking did not include the specified room type");
        }

        // Check if user already reviewed this room type for this booking
        const existingReview = await reviewRepository.findOne({
            where: {
                booking: { id: booking_id },
                roomType: { id: room_type_id }
            }
        });
        if (existingReview) {
            throw new Error("You have already reviewed this room type for this booking");
        }

        // 2. Create Review
        const review = reviewRepository.create({
            booking: { id: booking_id },
            user: { id: user_id },
            roomType: { id: room_type_id },
            rating,
            comment,
            is_hidden: false
        });

        const savedReview = await reviewRepository.save(review);

        // 3. Recalculate and Cache Stats
        await reviewService.updateRoomTypeStats(room_type_id);

        return savedReview;
    },

    toggleVisibility: async (reviewId: number, hidden: boolean, currentUser: any) => {
        if (currentUser.role !== UserRole.ADMIN) {
            throw new Error("Only admins can moderate reviews");
        }

        const review = await reviewRepository.findOne({
            where: { id: reviewId },
            relations: ["roomType"]
        });

        if (!review) throw new Error("Review not found");

        review.is_hidden = hidden;
        await reviewRepository.save(review);

        // Update stats since a review was hidden/unhidden
        await reviewService.updateRoomTypeStats(review.roomType.id);

        return review;
    },

    getReviewsByRoomType: async (roomTypeId: number) => {
        return await reviewRepository.find({
            where: {
                roomType: { id: roomTypeId },
                is_hidden: false
            },
            relations: ["user"],
            order: { created_at: "DESC" }
        });
    },

    updateRoomTypeStats: async (roomTypeId: number) => {
        const stats = await reviewRepository
            .createQueryBuilder("review")
            .select("AVG(review.rating)", "average")
            .addSelect("COUNT(review.id)", "count")
            .where("review.roomType.id = :roomTypeId", { roomTypeId })
            .andWhere("review.is_hidden = :isHidden", { isHidden: false })
            .getRawOne();

        const average = parseFloat(stats.average) || 0;
        const count = parseInt(stats.count) || 0;

        await roomTypeRepository.update(roomTypeId, {
            average_rating: average,
            review_count: count
        });
    }
};

export default reviewService;
