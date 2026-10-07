import app from './src/app';
import { connectDB } from './src/config/db';
import { Request, Response } from 'express';

export default async function (req: Request, res: Response) {
  // Ensure DB is connected before handling the request
  await connectDB();
  
  // Delegate the request to the Express app
  return app(req, res);
}
