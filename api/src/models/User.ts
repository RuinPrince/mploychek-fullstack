import { Schema, model, Document } from 'mongoose';

export type UserRole = 'GENERAL_USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface IUser extends Document {
  userId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    userId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['GENERAL_USER', 'ADMIN'], default: 'GENERAL_USER' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
