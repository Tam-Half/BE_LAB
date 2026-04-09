import { AppDataSource } from "../data-source";
import { Room } from "../dto/Room";
import { Floor } from "../dto/Floor";
import { RoomType } from "../dto/RoomType";
import { BookingRoomAllocation } from "../dto/BookingRoomAllocation";
import { RoomStatus } from "../dto/Enums";

const roomRepository = AppDataSource.getRepository(Room);
const floorRepository = AppDataSource.getRepository(Floor);
const roomTypeRepository = AppDataSource.getRepository(RoomType);
const allocationRepository = AppDataSource.getRepository(BookingRoomAllocation);

const roomService = {
    create: async (payload: any) => {
        const floor = await floorRepository.findOne({ where: { id: payload.floor_id } });
        const roomType = await roomTypeRepository.findOne({ where: { id: payload.room_type_id } });

        if (!floor) throw new Error("Tầng không tồn tại");
        if (!roomType) throw new Error("Loại phòng không tồn tại");

        const room = roomRepository.create({
            ...payload,
            floor,
            roomType
        });
        return await roomRepository.save(room);
    },
    update: async (id: number, payload: any) => {
        const room = await roomRepository.findOne({ where: { id } });
        if (!room) throw new Error("Phòng không tồn tại");

        if (payload.floor_id) {
            const floor = await floorRepository.findOne({ where: { id: payload.floor_id } });
            if (!floor) throw new Error("Tầng không tồn tại");
            room.floor = floor;
        }
        if (payload.room_type_id) {
            const roomType = await roomTypeRepository.findOne({ where: { id: payload.room_type_id } });
            if (!roomType) throw new Error("Loại phòng không tồn tại");
            room.roomType = roomType;
        }

        roomRepository.merge(room, payload);
        return await roomRepository.save(room);
    },
    delete: async (id: number) => {
        const room = await roomRepository.findOne({ where: { id } });
        if (!room) throw new Error("Phòng không tồn tại");
        return await roomRepository.remove(room);
    },
    getAll: async () => {
        return await roomRepository.find({
            relations: ["floor", "roomType"]
        });
    },

    getRoomDetailTimeline: async (roomId: number) => {
        const now = new Date();

        const roomInfo = await roomRepository.findOne({ where: { id: roomId }, relations: ["roomType"] });
        if (!roomInfo) throw new Error("Room not found");

        const allocations = await allocationRepository.find({
            where: { room: { id: roomId } },
            relations: [
                "bookingRoom",
                "bookingRoom.booking",       // Lấy thông tin Booking tổng (mã BK, note...)
                "bookingRoom.booking.user"   // Lấy thông tin khách hàng
            ],
            order: { check_in_date: "ASC" }
        });

        // 3. Phân loại dữ liệu
        const timeline = {
            room_info: {
                id: roomInfo.id,
                name: roomInfo.room_number, // Ví dụ: "201"
                type: roomInfo.roomType.name // Ví dụ: "standard-single"
            },
            current_booking: null as any, // Phòng đang có người ở (hoặc đang trong giờ check-in)
            future_bookings: [] as any[], // Khách sắp đến
            past_bookings: [] as any[]    // Khách đã trả phòng
        };

        allocations.forEach((alloc) => {
            const checkIn = new Date(alloc.check_in_date);
            const checkOut = new Date(alloc.check_out_date);

            const bookingData = {
                allocation_id: alloc.id,
                booking_id: alloc.bookingRoom?.booking?.id,
                booking_code: alloc.bookingRoom?.booking?.booking_code,
                guest_name: alloc.bookingRoom?.booking?.guest_name || alloc.bookingRoom?.booking?.user?.name || "Khách lẻ",
                guest_phone: alloc.bookingRoom?.booking?.guest_phone,
                check_in: alloc.check_in_date,
                check_out: alloc.check_out_date,
                status: alloc.status, // "NOT_CHECKED_IN", "CHECKED_IN", "CHECKED_OUT"
                payment_status: alloc.bookingRoom?.booking?.payment_status,
                total_booking_price: alloc.bookingRoom?.booking?.total_price
            };


            if (alloc.status === 'CHECKED_IN' || (checkIn <= now && checkOut >= now && alloc.status !== 'CHECKED_OUT')) {
                timeline.current_booking = bookingData;
            }
            else if (checkIn > now) {
                timeline.future_bookings.push(bookingData);
            }
            else {
                timeline.past_bookings.push(bookingData);
            }
        });

        timeline.past_bookings.sort((a, b) => new Date(b.check_out).getTime() - new Date(a.check_out).getTime());

        return timeline;
    },


    getRoomGridStatus: async (floor_id?: number) => {
        const now = new Date();

        const rooms = await roomRepository.find({
            where: floor_id ? { floor: { id: floor_id } } : {},
            relations: [
                "floor",
                "roomType",
                "roomAllocations",
                "roomAllocations.bookingRoom",
                "roomAllocations.bookingRoom.booking",
            ]
        });

        return rooms.map(room => {
            const allocations = room.roomAllocations || [];

            const activeAllocation = allocations.find(alloc => {
                const checkIn = new Date(alloc.check_in_date);
                const checkOut = new Date(alloc.check_out_date);
                return (checkIn <= now && checkOut >= now && alloc.status !== 'CHECKED_OUT') || alloc.status === 'CHECKED_IN';
            });

            let finalStatus = "NOT_CHECKED_IN";

            if (room.status === 'MAINTENANCE') {
                finalStatus = "MAINTENANCE";
            }
            else if (activeAllocation) {
                finalStatus = "CHECKED_IN";
            }
            return {
                id: room.id,
                room_number: room.room_number,
                roomType: room.roomType,
                status: finalStatus,
                current_guest: activeAllocation?.bookingRoom?.booking?.guest_name || null,
                floor: room.floor || null
            };
        });
    }

}

export default roomService;
