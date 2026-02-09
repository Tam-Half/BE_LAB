import { AppDataSource } from "../data-source";
import { Account } from "../dto/Account";
import { User } from "../dto/User";
import { encrypt } from "../helpers/helpers";

const accountRepository = AppDataSource.getRepository(Account);
const userRepository = AppDataSource.getRepository(User);

const userService = {
    create: async (payload: any) => {
        const existingEmail = await accountRepository.findOne({ where: { email: payload.email } });
        if (existingEmail) {
            throw new Error("Email đã được sử dụng");
        }

        const existingPhone = await userRepository.findOne({ where: { phone_number: payload.phone_number } });
        if (existingPhone) {
            throw new Error("Số điện thoại đã được sử dụng");
        }

        const password = payload.password;
        const hasedPassword = await encrypt.encryptPassword(password);
        const account = accountRepository.create({
            username: payload.username,
            email: payload.email,
            password: hasedPassword,
            role: payload.role,
            is_active: true,
        });
        const newAccount = await accountRepository.save(account);
        const user = userRepository.create({
            account: newAccount,
            name: payload.name,
            phone_number: payload.phone_number,
            avatar_url: payload.avatar_url,
        })
        const newUser = await userRepository.save(user);
        return newUser;
    },
    getProfile: async (userId: string) => {
        return await userRepository.findOne({
            where: { id: userId },
            relations: ["account"]
        });
    },
    forgotPassword: async (email: string) => {
        const account = await accountRepository.findOne({ where: { email } });
        if (!account) {
            throw new Error("Không tìm thấy tài khoản với email này");
        }
        // In a real app, send email with reset token here
        return true;
    },
    resetPassword: async (email: string, newPassword: string) => {
        const account = await accountRepository.findOne({ where: { email } });
        if (!account) {
            throw new Error("Không tìm thấy tài khoản với email này");
        }
        const hashedPassword = await encrypt.encryptPassword(newPassword);
        account.password = hashedPassword;
        await accountRepository.save(account);
        return true;
    }
}

export default userService;