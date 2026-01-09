import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    IntegerType,
    ForeignKey,
    OneToOne,
    JoinColumn,
} from "typeorm";
import { Account } from "./Account";

@Entity({ name: "users" })
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToOne(() => Account, { onDelete: "CASCADE" })
    @JoinColumn({ name: "account_id" })
    account: Account;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    phone_number: string;

    @Column({ nullable: false })
    address: string;

    @Column()
    avatar_url: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}