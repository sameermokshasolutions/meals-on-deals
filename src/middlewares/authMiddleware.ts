import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import createHttpError from 'http-errors';
import { config } from '../config/config';

export const authenticateToken = (req: any, res: Response, next: NextFunction): void => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token || token === 'null' || token === 'undefined') {
      throw createHttpError(401, 'Unauthorized access');
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    next(createHttpError(401, 'Invalid token'));
  }
};



