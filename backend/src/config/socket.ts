import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { getAllowedOrigins } from './cors.js';

let io: Server | null = null;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: getAllowedOrigins(),
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.emit('server:ready', {
      message: 'Football dashboard socket connected',
    });
  });

  return io;
};

export const emitSocketEvent = (event: string, payload?: unknown) => {
  io?.emit(event, payload);
};
