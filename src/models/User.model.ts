import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    githubId?: string;
  }
  const UserSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true, trim: true, },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    githubId: { type: String, required: false, unique: true },
  });

  export const User = mongoose.model<IUser>('User', UserSchema);