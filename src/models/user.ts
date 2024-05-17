import mongoose, { Schema, model, ObjectId } from "mongoose";
import validator from "validator"

export interface IUser extends Document {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isActive: boolean;
  comparePassword(enteredPassword: string): Promise<boolean>;
  generateToken(): string;
}

const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: [true, "First Name of the user is required"],
  },
  lastName: {
    type: String,
    required: [true, "Last Name of the user is required"],
  },
  email: {
    type: String,
    unique: true,
    validate: validator.isEmail,
    required: [true, "Email of the user is required"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
},{
  timestamps:true
});

const User = model<IUser>("User", userSchema);

export default User; 