import { Schema, model, ObjectId } from "mongoose";
import validator from "validator"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

export interface IUser extends Document {
  _id: ObjectId;
  username: string;
  email: string;
  password: string;
  groupId: ObjectId;
  isActive: boolean;
  otp: number | undefined;
  otp_expire: Date | undefined;
  comparePassword(enteredPassword: string): Promise<boolean>;
  generateToken(): string;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
    validate: validator.isEmail,
  },
  password: {
    type: String,
  },
  groupId: {
    type: Schema.Types.ObjectId,
    ref: "Group",
    required: [true, "User needs to be associated with a group"],
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: Number,
    default: undefined
  },
  otp_expire: {
    type: Date,
    default: undefined
  }
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