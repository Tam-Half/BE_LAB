import { AppDataSource } from "../data-source";
import { Room } from "../dto/Room";
import { Floor } from "../dto/Floor";
import { RoomType } from "../dto/RoomType";
import { BookingRoomAllocation } from "../dto/BookingRoomAllocation";

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

        // 1. Lấy thông tin phòng
        const roomInfo = await roomRepository.findOne({ where: { id: roomId }, relations: ["roomType"] });
        if (!roomInfo) throw new Error("Room not found");

        // 2. Lấy toàn bộ lịch sử đặt của phòng này
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

            // Format dữ liệu trả về cho FE dễ hiển thị
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

            // LOGIC QUAN TRỌNG: Phân loại dựa vào thời gian và status
            
            // Trường hợp 1: Đang ở (Thời gian hiện tại nằm trong khoảng check-in/out VÀ chưa check-out)
            // Hoặc status cụ thể là "CHECKED_IN"
            if (alloc.status === 'CHECKED_IN' || (checkIn <= now && checkOut >= now && alloc.status !== 'CHECKED_OUT')) {
                timeline.current_booking = bookingData;
            } 
            // Trường hợp 2: Tương lai (Chưa đến ngày check-in)
            else if (checkIn > now) {
                timeline.future_bookings.push(bookingData);
            } 
            // Trường hợp 3: Quá khứ (Đã qua ngày check-out hoặc đã set status CHECKED_OUT)
            else {
                timeline.past_bookings.push(bookingData);
            }
        });

        // Sắp xếp lại danh sách quá khứ (Mới nhất lên đầu)
        timeline.past_bookings.sort((a, b) => new Date(b.check_out).getTime() - new Date(a.check_out).getTime());

        return timeline;
    },
    

}

export default roomService;
