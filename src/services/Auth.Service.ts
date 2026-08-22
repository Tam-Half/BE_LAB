import { encrypt } from "../helpers/helpers";
import { AppDataSource } from "../data-source";
import { Account } from "../dto/Account";
import { User } from "../dto/User";
import { UserRole } from "../dto/Enums";
import redisClient from "../config/redis";

const accountRepository = AppDataSource.getRepository(Account);
const userRepository = AppDataSource.getRepository(User);

const authService = {
    login: async (payload: any) => {
        try {
            const { username, password } = payload;
            const account = await accountRepository.findOneBy({ username });
            if (!account) {
                throw new Error("Tài khoản không tồn tại");
            }
            const isPasswordValid = await encrypt.comparePassword(password, account.password);
            if (!isPasswordValid) {
                throw new Error("Mật khẩu không chính xác");
            }
            const user = await userRepository.findOne({ where: { account: { id: account.id } } });
            if (!user) {
                throw new Error("Người dùng không tồn tại");
            }
            const access_token = encrypt.generateAccessToken({ id: user.id, role: account.role as UserRole });
            const refresh_token = encrypt.generateRefreshToken({ id: user.id, role: account.role as UserRole });
            const accountId = account.id;
            console.log("Account ID:", accountId);
            const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;
            await redisClient.set(accountId.toString(), refresh_token, {
                EX: REFRESH_TOKEN_TTL
            });
            return { access_token, refresh_token, accountId };
        } catch (error) {
            throw error;
        }
    },

    refreshToken: async (payload: { refresh_token: string }) => {
        try {
            const { refresh_token } = payload;
            if (!refresh_token) {
                throw new Error("Refresh token không được cung cấp");
            }

            const decoded = await encrypt.verifyRefreshToken(refresh_token);

            const storedToken = await redisClient.get(`refresh_token:${decoded.id}`);

            if (!storedToken || storedToken !== refresh_token) {
                throw new Error("Token không hợp lệ, đã bị thu hồi hoặc đã hết hạn trong Redis!");
            }

            const user = await userRepository.findOneBy({ id: decoded.id });
            if (!user) {
                throw new Error("Người dùng không tồn tại hoặc đã bị xóa");
            }

            const new_access_token = encrypt.generateAccessToken({ id: user.id, role: decoded.role });
            const new_refresh_token = encrypt.generateRefreshToken({ id: user.id, role: decoded.role });

            await redisClient.set(`refresh_token:${user.id}`, new_refresh_token, {
                EX: 7 * 24 * 60 * 60
            });
            
            return {
                access_token: new_access_token,
                refresh_token: new_refresh_token
            };
        } catch (error) {
            throw error;
        }
    }
}
export default authService;