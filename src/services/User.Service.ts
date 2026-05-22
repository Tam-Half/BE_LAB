import { AppDataSource } from "../data-source";
import { Account } from "../dto/Account";
import { User } from "../dto/User";
import { UserRole } from "../dto/Enums";
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
            role: payload.role || UserRole.USER,
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
    },
    getAccountsForAdmin: async () => {
        return await userRepository.find({
            relations: ["account"],
            order: { createdAt: "DESC" }
        });
    },
    updateAccountByAdmin: async (userId: string, payload: any) => {
        const user = await userRepository.findOne({
            where: { id: userId },
            relations: ["account"]
        });
        if (!user) {
            throw new Error("Không tìm thấy người dùng");
        }

        user.name = payload.name;
        user.phone_number = payload.phone_number;
        await userRepository.save(user);

        const account = user.account;
        if (account) {
            if (payload.email && payload.email !== account.email) {
                const existingEmail = await accountRepository.findOne({ where: { email: payload.email } });
                if (existingEmail) {
                    throw new Error("Email đã được sử dụng");
                }
                account.email = payload.email;
            }
            if (payload.role) {
                account.role = payload.role;
            }
            if (payload.is_active !== undefined) {
                account.is_active = payload.is_active;
            }
            await accountRepository.save(account);
        }
        return user;
    },
    resetPasswordByAdmin: async (userId: string, newPassword: string) => {
        const user = await userRepository.findOne({
            where: { id: userId },
            relations: ["account"]
        });
        if (!user) {
            throw new Error("Không tìm thấy người dùng");
        }
        const account = user.account;
        if (!account) {
            throw new Error("Không tìm thấy tài khoản liên kết");
        }
        const hashedPassword = await encrypt.encryptPassword(newPassword);
        account.password = hashedPassword;
        await accountRepository.save(account);
        return true;
    }
}

export default userService;