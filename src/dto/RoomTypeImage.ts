import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { RoomType } from "./RoomType";

@Entity({ name: "room_type_images" })
export class RoomTypeImage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string;

    @Column()
    public_id: string;

    @ManyToOne(() => RoomType, (roomType) => roomType.images, { onDelete: "CASCADE" })
    @JoinColumn({ name: "room_type_id" })
    roomType: RoomType;
}
