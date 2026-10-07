import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { delay } from './middleware/delay';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import recordsRoutes from './routes/records.routes';

const app = express();

// --------------- Global Middleware ---------------
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------- Health Check (before delay) -----
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// --------------- Delay (all /api except health) --
app.use('/api', delay);

// --------------- API Routes ----------------------
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/records', recordsRoutes);

// --------------- Error Handler (must be last) ----
app.use(errorHandler);

export default app;
