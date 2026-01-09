import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "amenities" })
export class Amenities {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "text", nullable: true })
    name: string;

    @Column({ nullable: true })
    icon_url: string;

    @Column({ nullable: true })
    type: string;
}
