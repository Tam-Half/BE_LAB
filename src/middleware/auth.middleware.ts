import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
// const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require('../config/jwt');

dotenv.config();

const { JWT_SECRET = "" } = process.env;
export const authentification = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).json({ message: "Unauthorized: Không có header" });
    }
    
    const token = header.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: Không có token" });
    }

    try {
        // Đưa jwt.verify vào trong try-catch để bắt lỗi hết hạn
        const decode = jwt.verify(token, JWT_SECRET);
        
        req["currentUser"] = decode;
        next();
        
    } catch (error: any) {
        // Bắt chính xác lỗi hết hạn của jsonwebtoken
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Access Token đã hết hạn" });
        }
        
        // Bắt các lỗi khác (sai chữ ký, token bị can thiệp...)
        return res.status(401).json({ message: "Access Token không hợp lệ" });
    }
};

export const checkRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const currentUser = req["currentUser"];
        if (!currentUser || !allowedRoles.includes(currentUser.role)) {
            return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này (Forbidden)" });
        }
        next();
    };
};