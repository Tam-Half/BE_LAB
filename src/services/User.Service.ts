import { AppDataSource } from "../data-source";
import { Account } from "../dto/Account";
import { User } from "../dto/User";
import { encrypt } from "../helpers/helpers";

const accountRepository = AppDataSource.getRepository(Account);
const userRepository = AppDataSource.getRepository(User);

const userService = {
    create: async (payload: any) => {
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
            address: payload.address,
            avatar_url: payload.avatar_url,
        })
        const newUser = await userRepository.save(user);
        return newUser;
    }
}

export default userService;