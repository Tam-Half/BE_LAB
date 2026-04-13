import { AppDataSource } from "../data-source";
import { RoomClass } from "../dto/RoomClass";

const roomClassRepository = AppDataSource.getRepository(RoomClass);

const RoomClassService = {
    create: async (payload: any) => {
        const roomClass = roomClassRepository.create(payload);
        return await roomClassRepository.save(roomClass);
    },

    update: async (id: number, payload: any) => {
        const roomClass = await roomClassRepository.findOneBy({ id });
        if (!roomClass) throw new Error("Hạng phòng không tồn tại");
        
        roomClassRepository.merge(roomClass, payload);
        return await roomClassRepository.save(roomClass);
    },

    delete: async (id: number) => {
        const roomClass = await roomClassRepository.findOneBy({ id });
        if (!roomClass) throw new Error("Hạng phòng không tồn tại");
        
        return await roomClassRepository.remove(roomClass);
    },

    getAll: async () => {
        return await roomClassRepository.find({
            order: { id: "ASC" }
        });
    },

    getById: async (id: number) => {
        return await roomClassRepository.findOne({
            where: { id },
            relations: ["roomTypes"]
        });
    }
};

export default RoomClassService;
