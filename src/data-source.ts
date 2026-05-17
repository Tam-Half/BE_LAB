import "reflect-metadata"
import { DataSource } from "typeorm"
import * as dotenv from "dotenv"

import { User } from "./dto/User"
import { Account } from "./dto/Account"
import { Hotel } from "./dto/Hotel"
import { Floor } from "./dto/Floor"
import { RoomType } from "./dto/RoomType"
import { RoomTypeImage } from "./dto/RoomTypeImage"
import { Room } from "./dto/Room"
import { RoomClass } from "./dto/RoomClass"
import { Amenities } from "./dto/Amenities"
import { RoomTypeAmenities } from "./dto/RoomTypeAmenities"
import { Promotion } from "./dto/Promotion"
import { Booking } from "./dto/Booking"
import { BookingDetail } from "./dto/BookingDetail"
import { Review } from "./dto/Review"
import { BookingRoomAllocation } from "./dto/BookingRoomAllocation"
import { Payment } from "./dto/Payment"
import { BookingRoom } from "./dto/BookingRoom"
import { ServiceOrder } from "./dto/ServiceOrder"
import { ExtraService } from "./dto/ExtraService"
import { Shift } from "./dto/Shift"

import { getDatabaseCredentials } from "./vault"

dotenv.config()

const isProduction = process.env.NODE_ENV === "production"

export const AppDataSource = new DataSource({
    type: "postgres",

    ...(isProduction
        ? {
            url: process.env.DB_URL,
            ssl: {
                rejectUnauthorized: false
            }
        }
        : {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),

            // temporary value (sẽ bị override bởi Vault)
            username: "temp",
            password: "temp",

            database: process.env.DB_NAME
        }),

    synchronize: true,
    logging: false,

    entities: [
        User,
        Account,
        Hotel,
        Floor,
        Room,
        RoomType,
        RoomClass,
        RoomTypeImage,
        Amenities,
        RoomTypeAmenities,
        Promotion,
        Booking,
        BookingDetail,
        Review,
        BookingRoomAllocation,
        Payment,
        BookingRoom,
        ServiceOrder,
        ExtraService,
        Shift
    ],

    migrations: [],
    subscribers: [],
})

export async function initDataSource() {

    const creds = await getDatabaseCredentials()

    console.log("Vault username:", creds.username)
    console.log("Vault TTL:", creds.ttl, "seconds")

    AppDataSource.setOptions({
        username: creds.username,
        password: creds.password
    })

    await AppDataSource.initialize()

    console.log("Database connected using Vault dynamic credentials")

    // dùng TTL từ Vault
    setTimeout(async () => {

        console.log("Vault lease expired → closing DB connection")

        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy()
            console.log("Database connection closed")
        }

    }, creds.ttl * 1000)
}