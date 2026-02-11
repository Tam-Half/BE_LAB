import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Booking } from "./Booking";
import { RoomType } from "./RoomType";
import { BookingRoom } from "./BookingRoom";

@Entity({ name: "booking_details" })
export class BookingDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Booking, (booking) => booking.id)
    @JoinColumn({ name: "booking_id" })
    booking: Booking;

    @ManyToOne(() => RoomType, (roomType) => roomType.id)
    @JoinColumn({ name: "room_type_id" })
    roomType: RoomType;

    @Column({ nullable: false })
    quantity: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
    price_at_booking: number;

    @OneToMany(() => BookingRoom, (br) => br.bookingDetail)
    bookingRooms: BookingRoom[];
}
