import { Schema, model, ObjectId } from "mongoose";
import validator from "validator"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

export interface IUser extends Document {
  _id: ObjectId;
  username: string;
  email: string;
  password: string;
  isActive: boolean;
  comparePassword(enteredPassword: string): Promise<boolean>;
  generateToken(): string;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    unique: true,
    required: [true, "Username of the user is required"],
  },
  email: {
    type: String,
    unique: true,
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  isActive: {
    type: Boolean,
    default: false,
  },
},{
  timestamps:true
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    }
  );
};

const User = model<IUser>("User", userSchema);

export default User; 