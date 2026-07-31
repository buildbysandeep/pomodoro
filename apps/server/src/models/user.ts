import mongoose, { Schema, type Document } from "mongoose";

export interface UserDocument extends Document {
  email: string;
  password?: string;
  name: string;
  avatar?: string;
  googleId?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, select: false },
    name: { type: String, required: true },
    avatar: { type: String },
    googleId: { type: String, sparse: true, unique: true },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<UserDocument>("User", UserSchema);
