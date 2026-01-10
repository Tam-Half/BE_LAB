import { AppDataSource } from "../data-source";
import { Hotel } from "../dto/Hotel";

const hotelRepository = AppDataSource.getRepository(Hotel);

const hotelService = {
    create: async (payload: any) => {
        try {
            const hotel = hotelRepository.create(payload);
            return await hotelRepository.save(hotel);
        } catch (error) {
            throw error;
        }
    },
    update: async (id: number, hotel: Hotel) => {
        try {
            const updatedHotel = await hotelRepository.update(id, hotel);
            return updatedHotel;
        } catch (error) {
            throw error;
        }
    },
    delete: async (id: number) => {
        try {
            const hotel = await hotelRepository.findOne({ where: { id } });
            if (!hotel) {
                throw new Error("Hotel not found");
            }
            return await hotelRepository.remove(hotel);
        } catch (error) {
            throw error;
        }
    }
}
export default hotelService;
