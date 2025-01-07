// src/index.ts
import app from "./app";
import { config } from "./config/config";
import connectDb from "./config/db";
import { createServer } from 'http';
import { initializeSocket } from './config/socket';

const startServer = async () => {
  try {
    // connect to database
    await connectDb();
    
    const httpServer = createServer(app);
    const io = initializeSocket(httpServer);
    
    const port = config.port || 3000;
    httpServer.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();