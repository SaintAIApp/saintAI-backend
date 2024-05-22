import User, { IUser } from "../models/user";
import bcrypt from "bcrypt";
import AppError from "../utils/AppError";

class UserServices {
    async signup(username: string, email: string, password: string) : Promise<IUser | null>{
        const user = await User.findOne({
            $or: [{ username: username }, { email: email }],
        });

        if (user) {
            throw new AppError(400, "User already exists");
        }

        const newUser = User.create({
            username: username,
            email: email,
            password: password,
        });
    
        return newUser;
    }

    async login(username: string, password: string): Promise<IUser | null> {
        const user = await User.findOne({ username });

        if (!user) {
            throw new AppError(400, "User does not exists");
        }

        const isMatched = await user.comparePassword(password);

        if (!isMatched) {
            throw new AppError(400, "Incorrect username or password");
        }

        return user;
    }

}

export default new UserServices();