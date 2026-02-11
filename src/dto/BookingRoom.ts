import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Check,
    Index,
} from "typeorm";
import { Booking } from "./Booking";
import { RoomType } from "./RoomType";
import { BookingDetail } from "./BookingDetail";
import { BookingRoomAllocation } from "./BookingRoomAllocation";

@Entity({ name: "booking_rooms" })
export class BookingRoom {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Booking, (booking) => booking.bookingRooms, { onDelete: "CASCADE" })
    @JoinColumn({ name: "booking_id" })
    booking: Booking;

    @ManyToOne(() => BookingDetail, (bd) => bd.bookingRooms, { onDelete: "CASCADE" })
    @JoinColumn({ name: "booking_detail_id" })
    bookingDetail: BookingDetail;

    @ManyToOne(() => RoomType, (rt) => rt.bookingRooms, { onDelete: "RESTRICT" })
    @JoinColumn({ name: "room_type_id" })
    roomType: RoomType;

    // Snapshot giá theo “phòng đặt” (tuỳ bạn có cần chốt chi tiết)
    @Column({ type: "decimal", precision: 15, scale: 2, nullable: true })
    price_at_booking: number;

    // Optional: snapshot policy/fees (linh hoạt hơn)
    @Column({ type: "jsonb", nullable: true })
    pricing_snapshot: any;

    // 1 booking_room thường chỉ có 1 allocation active
    @OneToOne(() => BookingRoomAllocation, (alloc) => alloc.bookingRoom)
    allocation: BookingRoomAllocation;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
