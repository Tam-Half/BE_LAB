import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
} from "typeorm";
import { RoomType } from "./RoomType";

@Entity({ name: "room_classes" })
export class RoomClass {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "decimal", precision: 3, scale: 2, default: 1.0 })
    price_multiplier: number;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => RoomType, (roomType) => roomType.roomClass)
    roomTypes: RoomType[];
}
