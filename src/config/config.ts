// configuration file for all types of env variables imports 
import { config as conf } from 'dotenv';

// Load .env variables
conf();

const _config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.MONGO_CONNECTION_STRING || '',
  env: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'sfasdfasdfasfas',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  HOST: process.env.HOST,
  SERVICE: process.env.SERVICE,
  EMAIL_PORT: Number(process.env.EMAIL_PORT),
  SECURE: Boolean(process.env.SECURE),
  USERID: process.env.USERID,
  EMAIL_NAME: process.env.EMAIL_NAME,
  PASS: process.env.PASS,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
};


// Export and freeze the object to avoid overriding 
export const config = Object.freeze(_config); 
