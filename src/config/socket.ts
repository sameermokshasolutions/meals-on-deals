// src/config/socket.ts
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export let io: SocketIOServer<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>;

export const initializeSocket = (httpServer: HTTPServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: true, // or specify your frontend URL
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle user joining a specific room (e.g., restaurant-specific updates)
    socket.on('join-room', (room: string) => {
      socket.join(room);
      socket.emit("connected");
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    // Handle user leaving a room
    socket.on('leave-room', (room: string) => {
      socket.leave(room);
      socket.emit("disconnected");
      console.log(`Socket ${socket.id} left room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

// Custom types for socket events
export interface ServerToClientEvents {
  'order-update': (data: { orderId: string; status: string }) => void;
  'restaurant-update': (data: { restaurantId: string; update: any }) => void;
}

export interface ClientToServerEvents {
  'join-room': (room: string) => void;
  'leave-room': (room: string) => void;
}
