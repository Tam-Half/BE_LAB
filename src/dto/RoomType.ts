import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
} from "typeorm";
import { RoomTypeImage } from "./RoomTypeImage";

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
}
