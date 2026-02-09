import { AppDataSource } from "../data-source";
import { Floor } from "../dto/Floor";
import { Hotel } from "../dto/Hotel";

const floorRepository = AppDataSource.getRepository(Floor);
const hotelRepository = AppDataSource.getRepository(Hotel);

const floorService = {
    getAll: async () => {
        return await floorRepository.find();
    },
    create: async (payload: any) => {
        const hotel = await hotelRepository.findOne({ where: { id: payload.hotel_id } });
        if (!hotel) {
            throw new Error("Hotel not found");
        }
        const floor = floorRepository.create({
            name: payload.name,
            hotel: hotel,
        });
        return await floorRepository.save(floor);
    },
    update: async (id: number, payload: any) => {
        const floor = await floorRepository.findOne({ where: { id } });
        if (!floor) {
            throw new Error("Floor not found");
        }
        return await floorRepository.update(id, payload);
    },
    delete: async (id: number) => {
        const floor = await floorRepository.findOne({ where: { id } });
        if (!floor) {
            throw new Error("Floor not found");
        }
        return await floorRepository.remove(floor);
    }
}

export default floorService;
