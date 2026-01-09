import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { RoomType } from "./RoomType";
import { Amenities } from "./Amenities";

@Entity({ name: "room_type_amenities" })
export class RoomTypeAmenities {
    @PrimaryColumn()
    room_type_id: number;

    @PrimaryColumn()
    amenity_id: number;

    @ManyToOne(() => RoomType, (roomType) => roomType.id)
    @JoinColumn({ name: "room_type_id" })
    roomType: RoomType;

    @ManyToOne(() => Amenities, (amenity) => amenity.id)
    @JoinColumn({ name: "amenity_id" })
    amenity: Amenities;
}
