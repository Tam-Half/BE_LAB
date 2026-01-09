import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany
} from "typeorm";
import { User } from "./User";
import { Hotel } from "./Hotel";
import { Promotion } from "./Promotion";
import { BookingDetail } from "./BookingDetail";

@Entity({ name: "bookings" })
export class Booking {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => Hotel, (hotel) => hotel.id)
    @JoinColumn({ name: "hotel_id" })
    hotel: Hotel;

    @Column({ nullable: false, unique: true })
    booking_code: string;

    @Column({ type: "timestamp", nullable: false })
    check_in_date: Date;

    @Column({ type: "timestamp", nullable: false })
    check_out_date: Date;

    @Column({ type: "decimal", precision: 15, scale: 2, nullable: false })
    total_price: number;

    @Column({ nullable: false })
    status: string;

    @Column({ nullable: false })
    payment_status: string;

    @Column({ type: "text", nullable: true })
    note: string;

    @ManyToOne(() => Promotion, (promotion) => promotion.id, { nullable: true })
    @JoinColumn({ name: "promotion_id" })
    promotion: Promotion;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => BookingDetail, (bookingDetail) => bookingDetail.booking)
    bookingDetails: BookingDetail[];
}
