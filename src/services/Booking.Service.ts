import { AppDataSource } from "../data-source";
import { Booking } from "../dto/Booking";
import { BookingDetail } from "../dto/BookingDetail";
import { User } from "../dto/User";
import { Hotel } from "../dto/Hotel";
import { Promotion } from "../dto/Promotion";
import { RoomType } from "../dto/RoomType";
import { Room } from "../dto/Room";
import { BookingRoom } from "../dto/BookingRoom";
import { BookingRoomAllocation } from "../dto/BookingRoomAllocation";
import { ServiceOrder } from "../dto/ServiceOrder";
import { ExtraService } from "../dto/ExtraService";
import AvailabilityService from "./Availability.Service";
import { BookingFilter } from "../interfaces/Booking";
import { BookingStatus, BookingRoomAllocationStatus, ServiceOrderStatus, PaymentStatus } from "../dto/Enums";

const bookingRepository = AppDataSource.getRepository(Booking);
const bookingDetailRepository = AppDataSource.getRepository(BookingDetail);
const userRepository = AppDataSource.getRepository(User);
const hotelRepository = AppDataSource.getRepository(Hotel);
const promotionRepository = AppDataSource.getRepository(Promotion);
const roomTypeRepository = AppDataSource.getRepository(RoomType);
const roomRepository = AppDataSource.getRepository(Room);
const allocationRepository = AppDataSource.getRepository(BookingRoomAllocation);
const extraServiceRepository = AppDataSource.getRepository(ExtraService);
const serviceOrderRepository = AppDataSource.getRepository(ServiceOrder);

const bookingService = {
    create: async (payload: any) => {
        const {
            user_id,
            check_in_date,
            check_out_date,
            rooms, // Array of { roomTypeId, quantity }
            guest_name,
            guest_phone,
            guest_email,
            promotion_code,
            extra_services, // Array of { service_id, quantity }
            note
        } = payload;

        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            const checkIn = new Date(check_in_date);
            const checkOut = new Date(check_out_date)
            if (checkOut <= checkIn) {
                throw new Error("Check-out date must be after check-in date");
            }

            const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
            let promotion = null;
            if (promotion_code) {
                promotion = await promotionRepository.findOneBy({ code: promotion_code, is_active: true });
            }

            const user = user_id ? await userRepository.findOneBy({ id: user_id }) : null;

            // Pre-calculate total price and fetch basic info
            let totalPrice = 0;
            const hotel = (await roomRepository.findOne({ where: {}, relations: ["floor", "floor.hotel"] }))?.floor.hotel;
            // Note: In real world, we'd probably get hotel_id from payload or room types. 
            // For now, assuming rooms belong to the same hotel.

            // 1. Create Booking Master
            const booking = transactionalEntityManager.create(Booking, {
                user,
                hotel, // Should be verified if multiple hotels exist
                promotion,
                booking_code: `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                check_in_date: checkIn,
                check_out_date: checkOut,
                total_price: 0, // Update later
                status: BookingStatus.PENDING,
                payment_status: PaymentStatus.PENDING,
                order_code: Number(String(Date.now())),
                expires_at: new Date(Date.now() + 15 * 60 * 1000),
                note,
                guest_name,
                guest_phone,
                guest_email
            });

            const savedBooking = await transactionalEntityManager.save(booking);

            let calculatedTotalPrice = 0;

            for (const roomReq of rooms) {
                const roomType = await roomTypeRepository.findOneBy({ id: roomReq.roomTypeId });
                if (!roomType) throw new Error(`Room type ${roomReq.roomTypeId} not found`);

                const basePrice = Number(roomType.base_price) || 0;
                const itemTotal = basePrice * nights * roomReq.quantity;
                calculatedTotalPrice += itemTotal;

                // 2. Create Booking Detail (for each room type)
                const detail = transactionalEntityManager.create(BookingDetail, {
                    booking: savedBooking,
                    roomType: roomType,
                    quantity: roomReq.quantity,
                    price_at_booking: basePrice
                });
                const savedDetail = await transactionalEntityManager.save(detail);

                const availableRooms = await AvailabilityService.findAvailableRooms(roomType.id, checkIn, checkOut, roomReq.quantity, transactionalEntityManager);
                if (availableRooms.length < roomReq.quantity) {
                    throw new Error(`Insufficient availability for room type: ${roomType.name}`);
                }

                for (let i = 0; i < roomReq.quantity; i++) {
                    const physicalRoom = availableRooms[i];

                    // 3. Create Booking Room (individual room record)
                    const bookingRoom = transactionalEntityManager.create(BookingRoom, {
                        booking: savedBooking,
                        bookingDetail: savedDetail,
                        roomType: roomType,
                        price_at_booking: basePrice,
                        pricing_snapshot: {
                            base_price: basePrice,
                            nights: nights
                        }
                    });
                    const savedBookingRoom = await transactionalEntityManager.save(bookingRoom);

                    // 4. Create Allocation (physical room assignment)
                    const allocation = transactionalEntityManager.create(BookingRoomAllocation, {
                        bookingRoom: savedBookingRoom,
                        room: physicalRoom,
                        check_in_date: checkIn,
                        check_out_date: checkOut,
                        price_at_booking: basePrice,
                        status: BookingRoomAllocationStatus.NOT_CHECKED_IN
                    });
                    await transactionalEntityManager.save(allocation);
                }
            }

            // Apply promotion if any
            if (promotion && promotion.discount_percent) {
                const discount = (calculatedTotalPrice * promotion.discount_percent) / 100;
                calculatedTotalPrice -= Math.min(discount, promotion.max_discount_amount || discount);
            }

            savedBooking.total_price = calculatedTotalPrice;
            await transactionalEntityManager.save(savedBooking);

            // 5. Create Service Orders (Extra Services)
            if (extra_services && extra_services.length > 0) {
                for (const svcReq of extra_services) {
                    // Handle both { service_id, quantity } and simple service_id (number)
                    const svcId = typeof svcReq === 'object' ? svcReq.service_id : svcReq;
                    const service = await extraServiceRepository.findOneBy({ id: svcId });
                    if (!service) continue;

                    const unitPrice = Number(service.base_price) || 0;
                    const quantity = (typeof svcReq === 'object' ? svcReq.quantity : 1) || 1;
                    const svcTotal = unitPrice * quantity;

                    const serviceOrder = transactionalEntityManager.create(ServiceOrder, {
                        booking: savedBooking,
                        service: service,
                        service_name_snapshot: service.name,
                        quantity: quantity,
                        unit_price: unitPrice,
                        total_price: svcTotal,
                        status: ServiceOrderStatus.PENDING
                    });
                    await transactionalEntityManager.save(serviceOrder);

                    // Add to total booking price (optional, depending on business logic)
                    // If room price already covers it or if it's separate
                    calculatedTotalPrice += svcTotal;
                }

                // Final price update including services and 8% VAT
                const subtotal = calculatedTotalPrice;
                const vat = subtotal * 0.08;
                savedBooking.total_price = subtotal + vat;
                await transactionalEntityManager.save(savedBooking);
            } else {
                // Apply VAT even if no extra services
                const subtotal = calculatedTotalPrice;
                const vat = subtotal * 0.08;
                savedBooking.total_price = subtotal + vat;
                await transactionalEntityManager.save(savedBooking);
            }

            return await transactionalEntityManager.findOne(Booking, {
                where: { id: savedBooking.id },
                relations: [
                    "bookingDetails",
                    "bookingDetails.roomType",
                    "bookingRooms",
                    "bookingRooms.allocation",
                    "bookingRooms.allocation.room",
                    "user",
                    "hotel",
                    "promotion",
                    "serviceOrders",
                    "serviceOrders.service"
                ]
            });
        });
    },

    getAll: async (filters: BookingFilter) => {
        const { status, user_id, hotel_id, booking_code } = filters;

        // Xây dựng điều kiện lọc động
        const whereCondition: any = {};

        if (status) {
            whereCondition.status = status;
        }

        if (user_id) {
            whereCondition.user = { id: user_id };
        }

        if (hotel_id) {
            whereCondition.hotel = { id: hotel_id };
        }

        if (booking_code) {
            whereCondition.booking_code = booking_code;
        }

        return await bookingRepository.find({
            where: whereCondition,
            relations: ["bookingDetails", "bookingDetails.roomType", "bookingDetails.roomType.images", "user", "hotel", "promotion", "serviceOrders", "serviceOrders.service"],
            order: { created_at: "DESC" } // Thường booking nên hiện cái mới nhất lên đầu
        });
    },


    getById: async (id: number) => {
        return await bookingRepository.findOne({
            where: { id },
            relations: ["bookingDetails", "bookingDetails.roomType", "user", "hotel", "promotion", "serviceOrders", "serviceOrders.service"]
        });
    },

    update: async (id: number, payload: any) => {
        const booking = await bookingRepository.findOneBy({ id });
        if (!booking) throw new Error("Booking not found");

        bookingRepository.merge(booking, payload);
        return await bookingRepository.save(booking);
    },

    delete: async (id: number) => {
        const result = await bookingRepository.delete(id);
        return result;
    },

    confirmPayment: async (id: number, transactionId: string) => {
        const booking = await bookingRepository.findOneBy({ id });
        if (!booking) throw new Error("Booking not found");

        // Sử dụng chuẩn Enum thay vì chuỗi
        booking.payment_status = PaymentStatus.PAID;
        booking.status = BookingStatus.CONFIRMED;

        return await bookingRepository.save(booking);
    },

    updateRoomStatus: async (bookingId: number, allocationId: number, targetStatus: BookingRoomAllocationStatus) => {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            const validStatuses = [BookingRoomAllocationStatus.CHECKED_IN, BookingRoomAllocationStatus.CHECKED_OUT];

            // Ép kiểu targetStatus về enum để so sánh an toàn
            if (!validStatuses.includes(targetStatus)) {
                throw new Error("Trạng thái không hợp lệ. Chỉ chấp nhận CHECKED_IN hoặc CHECKED_OUT.");
            }

            const allocation = await transactionalEntityManager.findOne(BookingRoomAllocation, {
                where: { id: allocationId },
                relations: ["bookingRoom", "bookingRoom.booking"]
            });

            if (!allocation) {
                throw new Error("Không tìm thấy thông tin phân bổ phòng (Allocation) này.");
            }

            if (allocation.bookingRoom.booking.id !== bookingId) {
                throw new Error("Phòng này không thuộc về mã đặt phòng yêu cầu.");
            }

            // Thay thế TOÀN BỘ chuỗi cứng bằng Enum
            if (targetStatus === BookingRoomAllocationStatus.CHECKED_OUT && allocation.status !== BookingRoomAllocationStatus.CHECKED_IN) {
                throw new Error("Không thể trả phòng (Check-out) khi phòng chưa được nhận (Check-in).");
            }
            if (targetStatus === BookingRoomAllocationStatus.CHECKED_IN && allocation.status === BookingRoomAllocationStatus.CHECKED_OUT) {
                throw new Error("Phòng này đã được trả (Check-out), không thể nhận lại.");
            }
            if (allocation.status === targetStatus) {
                throw new Error(`Phòng này đã ở trạng thái ${targetStatus} từ trước.`);
            }

            allocation.status = targetStatus;
            await transactionalEntityManager.save(allocation);

            const booking = await transactionalEntityManager.findOne(Booking, {
                where: { id: bookingId },
                relations: ["bookingRooms", "bookingRooms.allocation"]
            });

            if (booking) {
                const allAllocations = booking.bookingRooms.map(br => br.allocation);

                if (targetStatus === BookingRoomAllocationStatus.CHECKED_IN) {
                    // Nếu khách bắt đầu nhận phòng đầu tiên -> Chuyển Booking thành CHECKED_IN
                    if (booking.status !== BookingStatus.CHECKED_IN) {
                        booking.status = BookingStatus.CHECKED_IN;
                        await transactionalEntityManager.save(booking);
                    }
                } else if (targetStatus === BookingRoomAllocationStatus.CHECKED_OUT) {
                    // Nếu trả phòng, kiểm tra xem TẤT CẢ các phòng đã trả hết chưa?
                    const isAllCheckedOut = allAllocations.every(a => a.status === BookingRoomAllocationStatus.CHECKED_OUT);

                    if (isAllCheckedOut) {
                        booking.status = BookingStatus.COMPLETED;

                        // Đã xóa phần copy-paste lỗi ở đây. Chỉ dùng transactionalEntityManager.
                        await transactionalEntityManager.save(booking);
                    }
                }
            }

            return allocation;
        });
    },


    cancel: async (id: number, currentUser: any) => {
        return await AppDataSource.transaction(async (transactionalEntityManager) => {
            const booking = await transactionalEntityManager.findOne(Booking, {
                where: { id },
                relations: ["user", "bookingRooms", "bookingRooms.allocation", "serviceOrders"]
            });

            if (!booking) throw new Error("Booking not found");

            // Permission check: Owner or Admin
            if (currentUser.role !== 'admin' && booking.user.id !== currentUser.id) {
                throw new Error("You do not have permission to cancel this booking");
            }

            // Status check: Only allow PENDING or CONFIRMED to be cancelled
            const ALLOWED_STATUSES = [BookingStatus.PENDING, BookingStatus.CONFIRMED];
            if (!ALLOWED_STATUSES.includes(booking.status)) {
                throw new Error(`Cannot cancel booking with status: ${booking.status}. Only PENDING or CONFIRMED bookings can be cancelled.`);
            }

            const now = new Date();
            const checkIn = new Date(booking.check_in_date);
            const diffTime = checkIn.getTime() - now.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);

            let message = "";
            let refundAmount = 0;

            if (diffDays > 3) {
                refundAmount = Number(booking.total_price) * 0.5;
                message = `Hủy đơn đặt thành công, vui lòng liên hệ hotline của khách sạn để nhận lại ${refundAmount.toLocaleString('vi-VN')} VND `;
            } else {
                message = "Hủy đơn đặt thành công, bạn sẽ không được hoàn lại tiền đơn hàng này do thời gian hủy quá sát ngày check-in";
            }

            // Update statuses
            booking.status = BookingStatus.CANCELLED;
            await transactionalEntityManager.save(booking);

            // Cancel allocations (releases rooms)
            if (booking.bookingRooms) {
                for (const br of booking.bookingRooms) {
                    if (br.allocation) {
                        br.allocation.status = BookingRoomAllocationStatus.CANCELLED;
                        await transactionalEntityManager.save(br.allocation);
                    }
                }
            }

            // Cancel service orders
            if (booking.serviceOrders) {
                for (const so of booking.serviceOrders) {
                    if (so) {
                        so.status = ServiceOrderStatus.CANCELLED;
                        await transactionalEntityManager.save(so);
                    }
                }
            }

            return {
                booking,
                message,
                refundAmount
            };
        });
    }
};

export default bookingService;
