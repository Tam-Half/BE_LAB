import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./dto/User"
import { Account } from "./dto/Account"
import * as dotenv from "dotenv"

dotenv.config()

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [User, Account],
    migrations: [],
    subscribers: [],
})
