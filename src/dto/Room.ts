import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from "typeorm";
import { Floor } from "./Floor";
import { RoomType } from "./RoomType";
import { BookingRoomAllocation } from "./BookingRoomAllocation";

@Entity({ name: "rooms" })
export class Room {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    room_number: string;

    @ManyToOne(() => Floor, { onDelete: "CASCADE" })
    @JoinColumn({ name: "floor_id" })
    floor: Floor;

    @ManyToOne(() => RoomType, (roomType) => roomType.rooms, { onDelete: "SET NULL" })
    @JoinColumn({ name: "room_type_id" })
    roomType: RoomType;

    @Column({ nullable: true })
    status: string;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => BookingRoomAllocation, (a) => a.room)
    roomAllocations: BookingRoomAllocation[];
}
