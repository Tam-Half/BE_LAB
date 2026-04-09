import { encrypt } from "../helpers/helpers";
import { AppDataSource } from "../data-source";
import { Account } from "../dto/Account";
import { User } from "../dto/User";
import { UserRole } from "../dto/Enums";

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
            console.log("User tìm thấy:", user);
            if (!user) {
                throw new Error("Người dùng không tồn tại");
            }
            const access_token = encrypt.generateAccessToken({ id: user.id, role: account.role as UserRole });
            const refresh_token = encrypt.generateRefreshToken({ id: user.id, role: account.role as UserRole });
            return { access_token, refresh_token };
        } catch (error) {
            throw error;
        }
    }
}
export default authService;