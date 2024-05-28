import nodemailer, {SendMailOptions} from "nodemailer";
import AppError from "./AppError";

const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "wecodetech11@gmail.com",
        pass: "tdgt radx hbgb clvf",
    },
});

export const sendmail = async (mailOptions: SendMailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
  } catch (err: any) {
    console.log(err.message);
    
    throw new AppError(400, err.message);
  }
};