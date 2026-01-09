import { AppDataSource } from "../data-source";
import { Hotel } from "../dto/Hotel";

const hotelRepository = AppDataSource.getRepository(Hotel);

const hotelService = {
    update: async (id: string, hotel: Hotel) => {
        try {
            const updatedHotel = await hotelRepository.update(id, hotel);
            return updatedHotel;
        } catch (error) {
            throw error;
        }
    }
}
export default hotelService;
