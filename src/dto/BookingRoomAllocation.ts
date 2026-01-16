import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Booking } from "./Booking";
import { Room } from "./Room";

@Entity({ name: "booking_room_allocation" })
export class BookingRoomAllocation {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Booking, (booking) => booking.id)
    @JoinColumn({ name: "booking_id" })
    booking: Booking;

    @ManyToOne(() => Room, (room) => room.id)
    @JoinColumn({ name: "room_id" })
    room: Room;

    @Column({ type: "timestamp", nullable: true })
    check_in_date: Date;

    @Column({ type: "timestamp", nullable: true })
    check_out_date: Date;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    price_at_booking: number;
}
