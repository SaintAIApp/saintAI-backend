import { SendMailOptions } from "nodemailer";
import User, { IUser } from "../models/user";
import AppError from "../utils/AppError";
import { sendmail } from "../utils/sendMail";
import { ObjectId } from "mongoose";

class UserServices {
    async signup(username: string, email: string, password: string) : Promise<IUser | null>{
        const user = await User.findOne({
            $or: [{ username: username }, { email: email }],
        });

        if (user) {
            throw new AppError(400, "User already exists");
        }

        const randomNumber = Math.random() * (999999-100000) + 100000 
        const OTP = Math.floor(randomNumber)
        const opt_expire = 15 * 60 * 1000;
        const expiredDate = new Date(Date.now() + opt_expire);

        const newUser = await User.create({
            username: username,
            email: email,
            password: password,
            otp: OTP,
            otp_expire: expiredDate
        });

        await newUser.save();

        const mailOptions: SendMailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: email,
            subject: "OTP to verify on S.AI.N.T",
            text: `Your One Time Password to verify your email ID: ${OTP} \nPlease use it before 15 mins`
        }

        await sendmail(mailOptions);
    
        return newUser;
    }

    async login(email: string, password: string): Promise<IUser | null> {
        const user = await User.findOne({ email });

        if (!user) {
            throw new AppError(400, "User does not exists");
        }

        const isMatched = await user.comparePassword(password);

        if (!isMatched) {
            throw new AppError(400, "Incorrect email or password");
        }

        return user;
    }

    async verifyUser(otp: number): Promise<IUser | null> {
        const user = await User.findOne({
            otp,
            otp_expire: {
                $gt: Date.now()
            }
        });

        if (!user) 
            throw new AppError(400, "Incorrect OTP or has been expired");

        user.otp = undefined
        user.otp_expire = undefined
        user.isActive = true

        await user.save()
        console.log(user);
        
        return user;
    }

    async changePassword(id: ObjectId, oldPassword: string, newPassword: string): Promise<IUser | null> {
        const user = await User.findById(id).select("+password")

        if(!user) {
            throw new AppError(404, "user not found")
        }

        const isMatched = await user.comparePassword(oldPassword)

        if(!isMatched) throw new AppError(400, "Incorrect Old Password");

        user.password = newPassword
        await user.save()

        return user;
    }

    async forgotPassword(email: string): Promise<IUser | null> {
        const user = await User.findOne({email})

        if(!user) 
            throw new AppError(404, "Email not found")

        const randomNumber = Math.random() * (999999-100000) + 100000 
        const OTP = Math.floor(randomNumber)
        const opt_expire = 15 * 60 * 1000

        user.otp = OTP;
        user.otp_expire = new Date(Date.now() + opt_expire);

        await user.save()

        const mailOptions: SendMailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: email,
            subject: "OTP for resetting password",
            text: `Your OTP for reseting password is ${OTP}.\n Please ignore if you have not requested this.`
        }

        await sendmail(mailOptions);
    
        return user;
    }

    async resetPassword(otp: number, password: string): Promise<IUser | null> {
        const user = await User.findOne({
            otp,
            otp_expire: {
                $gt: Date.now()
            }
        })

        if (!user) 
            throw new AppError(400, "Incorrect OTP or has been expired")

        
        user.password=password
        user.otp = undefined
        user.otp_expire = undefined

        await user.save()

        return user;
    }

}

export default new UserServices();