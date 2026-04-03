import { AppDataSource } from "../data-source";
import { Room } from "../dto/Room";
import { Floor } from "../dto/Floor";
import { RoomType } from "../dto/RoomType";
import { RoomStatus } from "../dto/Enums";

const roomRepository = AppDataSource.getRepository(Room);
const floorRepository = AppDataSource.getRepository(Floor);
const roomTypeRepository = AppDataSource.getRepository(RoomType);

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
    }
}

export default roomService;
