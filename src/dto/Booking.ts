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
import { BookingRoom } from "./BookingRoom";
import { ServiceOrder } from "./ServiceOrder";

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

    @Column({ nullable: true })
    guest_count: number;

    @Column({ nullable: true })
    guest_email: string;

    @Column({ nullable: true })
    guest_name: string;

    @Column({ nullable: true })
    guest_phone: string;

    @ManyToOne(() => Promotion, (promotion) => promotion.id, { nullable: true })
    @JoinColumn({ name: "promotion_id" })
    promotion: Promotion;

    @Column({ type: "bigint", nullable: true, unique: true })
    order_code: number;

    @Column({ type: "timestamp", nullable: true })
    expires_at: Date;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => BookingDetail, (bookingDetail) => bookingDetail.booking)
    bookingDetails: BookingDetail[];

    @OneToMany(() => BookingRoom, (br) => br.booking)
    bookingRooms: BookingRoom[];

    @OneToMany(() => ServiceOrder, (so) => so.booking)
    serviceOrders: ServiceOrder[];
}
