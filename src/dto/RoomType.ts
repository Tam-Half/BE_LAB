import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { RoomTypeImage } from "./RoomTypeImage";
import { BookingRoom } from "./BookingRoom";
import { Review } from "./Review";
import { RoomClass } from "./RoomClass";

@Entity({ name: "room_types" })
export class RoomType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    slug: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "decimal", precision: 10, nullable: true })
    base_price: number;

    @Column({ nullable: true })
    capacity_people: number;

    @Column({ nullable: true })
    size_m2: number;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany("Room", "roomType")
    rooms: any[];

    @OneToMany(() => RoomTypeImage, (image) => image.roomType)
    images: RoomTypeImage[];

    @OneToMany(() => BookingRoom, (br) => br.roomType)
    bookingRooms: BookingRoom[];

    @OneToMany(() => Review, (review) => review.roomType)
    reviews: Review[];

    @Column({ type: "decimal", precision: 3, scale: 2, default: 0 })
    average_rating: number;

    @Column({ default: 0 })
    review_count: number;

    @Column({ nullable: true })
    room_class_id: number;

    @ManyToOne(() => RoomClass, (rc) => rc.roomTypes)
    @JoinColumn({ name: "room_class_id" })
    roomClass: RoomClass;
}
