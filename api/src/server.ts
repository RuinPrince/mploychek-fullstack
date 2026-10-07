import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

async function bootstrap(): Promise<void> {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
