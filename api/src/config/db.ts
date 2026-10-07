import mongoose from 'mongoose';
import { env } from './env';

let cached: typeof mongoose | null = null;

export async function connectDB(): Promise<void> {
  if (cached) {
    return;
  }
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    cached = mongoose;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}
