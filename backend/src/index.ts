import http from 'http';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import { initSocket } from './config/socket.js';

const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGODB_URI || '';

const startServer = async () => {
  await connectDatabase(mongoUri);

  const server = http.createServer(app);
  initSocket(server);

  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Football dashboard API running on port ${port}`);
  });
};

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
