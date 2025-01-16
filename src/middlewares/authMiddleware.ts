import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import createHttpError from 'http-errors';
import { config } from '../config/config';

export const authenticateToken = (req: any, res: Response, next: NextFunction): void => {

  try {

    const token = req.cookies.token; // Read the token from cookies

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret) as { id: string };

      req.user = { id: decoded.id }; // Attach the decoded user ID to the request
      next();
    } else {

      let authHeader = req.headers.authorization;

      if (authHeader === "bearer null" || authHeader === "bearer undefined")
        return next(createHttpError(401, 'Unauthorized access'));

      const jwtToken = authHeader.split(" ")[1];

      if (!jwtToken) return next(createHttpError(401, 'Unauthorized access'));


      const { id } = jwt.verify(jwtToken, config.jwtSecret) as { id: string };
      const user = { id };

      req.user = user;
      next();
    }
  } catch (err) {
    return next(createHttpError(401, 'Invalid or expired token'));
  }
};



