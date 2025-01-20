import express, { Application, Request, Response } from "express";
import path from "path";
import cors from "cors";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import cookieParser from 'cookie-parser';
// routers
import userRouter from "./routers/user/userRouter";

import coupenRouter from "./routers/coupens/coupenRouter";
import reportRouter from "./routers/reports/reportRouter";
import restaurantRouter from "./routers/restaurant/restaurentRouter";
import firebase from "./firebase/firebase";

firebase;

const app: Application = express();
// Middleware to parse cookies
app.use(cookieParser());
// CORS Configuration
const corsOptions = {
  origin: true, // or specify your frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body Parser Configuration
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});


// Deep linking with Android App
app.get('/.well-known/assetlinks.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, '.well-known', 'assetlinks.json'));
});

// API Routes
app.use('/api/users', userRouter);
app.use('/api/restaurant', restaurantRouter);

app.use('/api/coupons', coupenRouter);
app.use('/api/summary', reportRouter);


// Root route
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running !');
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Not Found',
    path: req.path
  });
});

// Helper function to find changes between objects
const getChangedFields = (oldObj: any, newObj: any) => {
  const changes: Record<string, { old: any; new: any }> = {};

  // Helper for nested object comparison
  const compareValues = (oldVal: any, newVal: any, path: string) => {
    if (Array.isArray(oldVal) && Array.isArray(newVal)) {
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes[path] = { old: oldVal, new: newVal };
      }
    } else if (
      oldVal && newVal &&
      typeof oldVal === 'object' &&
      typeof newVal === 'object'
    ) {
      Object.keys({ ...oldVal, ...newVal }).forEach(key => {
        compareValues(oldVal[key], newVal[key], path ? `${path}.${key}` : key);
      });
    } else if (oldVal !== newVal) {
      changes[path] = { old: oldVal, new: newVal };
    }
  };

  compareValues(oldObj, newObj, '');
  return changes;
};
// Error handler must be last
app.use(globalErrorHandler);

export default app;
