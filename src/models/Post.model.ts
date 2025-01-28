import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
    title: string;
    description: string;
    userId: mongoose.Schema.Types.ObjectId;
  }

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
    },
    { timestamps: true }
)

export default mongoose.model<IPost>('Post', postSchema)