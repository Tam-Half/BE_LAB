import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Booking } from "./Booking";
import { User } from "./User";
import { RoomType } from "./RoomType";
import { BookingRoom } from "./BookingRoom";

@Entity({ name: "reviews" })
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Booking, (booking) => booking.id)
    @JoinColumn({ name: "booking_id" })
    booking: Booking;

    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => RoomType, (roomType) => roomType.reviews)
    @JoinColumn({ name: "room_type_id" })
    roomType: RoomType;

    @Column({ nullable: false })
    rating: number;

    @Column({ type: "text", nullable: true })
    comment: string;

    @Column({ default: false })
    is_hidden: boolean;

    @CreateDateColumn()
    created_at: Date;
}
