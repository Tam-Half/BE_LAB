import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { Room } from "./Room";
import { BookingRoom } from "./BookingRoom";

@Entity({ name: "booking_room_allocation" })
export class BookingRoomAllocation {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => BookingRoom, (br) => br.allocation, { onDelete: "CASCADE" })
    @JoinColumn({ name: "booking_room_id" })
    bookingRoom: BookingRoom;

    @ManyToOne(() => Room, (room) => room.roomAllocations)
    @JoinColumn({ name: "room_id" })
    room: Room;

    @Column({ type: "timestamp", nullable: true })
    check_in_date: Date;

    @Column({ type: "timestamp", nullable: true })
    check_out_date: Date;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    price_at_booking: number;
}
