import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { User } from "../dto/User"
import { Account } from "../dto/Account";
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require('../config/jwt');

dotenv.config();
const { JWT_SECRET = "" } = process.env;


export class encrypt {
    static async encryptPassword(password: string) {
        return bcrypt.hashSync(password, 12);
    }
    static comparePassword(password: string, hashPassword: string) {
        return bcrypt.compareSync(password, hashPassword);
    }

    static generateAccessToken(payload: { id: string; role: string }) {
       // return jwt.sign({ id: payload.id, role: payload.role }, JWT_SECRET, { expiresIn: "24h" });
        return jwt.sign({ id: payload.id, role: payload.role }, ACCESS_TOKEN_SECRET, { expiresIn: "5s" });
    }
    static generateRefreshToken(payload: { id: string; role: string }) {
       // return jwt.sign({ id: payload.id, role: payload.role }, JWT_SECRET, { expiresIn: "7d" });
        return jwt.sign({ id: payload.id, role: payload.role }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    }

     static verifyRefreshToken(token: string): Promise<any> {
        return new Promise((resolve, reject) => {
            jwt.verify(
                token,
                REFRESH_TOKEN_SECRET,
                (err, decoded) => {
                    if (err) {
                        return reject(
                            new Error(
                                "Refresh token không hợp lệ hoặc đã hết hạn"
                            )
                        );
                    }

                    resolve(decoded);
                }
            );
        });
    }

}