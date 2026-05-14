import http from 'http';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import { initSocket } from './config/socket.js';

const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGODB_URI || '';

const startServer = async () => {
  const server = http.createServer(app);
  initSocket(server);

  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Football dashboard API running on port ${port}`);
  });

  // Open the HTTP port first so Render can detect a healthy web service.
  // Database connectivity is initialized immediately after startup.
  try {
    // eslint-disable-next-line no-console
    console.log('[startup] Connecting to MongoDB...');
    await connectDatabase(mongoUri);
    // eslint-disable-next-line no-console
    console.log('[startup] MongoDB connected');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[startup] MongoDB connection failed', error);
  }
};

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('[startup] Failed to start server', error);
  process.exit(1);
});
