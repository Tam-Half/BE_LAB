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
import { BookingRoomAllocation } from "./BookingRoomAllocation";

@Entity({ name: "booking_rooms" })
@Check(`"adult_count" >= 0`)
@Check(`"child_count" >= 0`)
@Check(`("child_count" = COALESCE(array_length("child_ages", 1), 0))`)
export class BookingRoom {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Booking, (booking) => booking.bookingRooms, { onDelete: "CASCADE" })
    @JoinColumn({ name: "booking_id" })
    booking: Booking;

    @ManyToOne(() => RoomType, (rt) => rt.bookingRooms, { onDelete: "RESTRICT" })
    @JoinColumn({ name: "room_type_id" })
    roomType: RoomType;

    // Người lớn user nhập
    @Column({ type: "int", default: 1 })
    adult_count: number;

    // Số trẻ em user nhập (tuổi nằm trong child_ages)
    @Column({ type: "int", default: 0 })
    child_count: number;

    // Lưu tuổi từng trẻ em: [2, 7, 12]...
    // (>=12 backend sẽ quy đổi tính như adult)
    @Column({ type: "int", array: true, default: () => "ARRAY[]::int[]" })
    child_ages: number[];

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
