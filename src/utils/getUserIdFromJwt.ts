import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

interface DecodedToken {
    id: string; // Adjust based on your JWT payload structure
    // Add more properties if your token includes them
}

export function getUserId(req: Request): string | null {
    // Extract the token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1]; // Assuming the format is "Bearer token"

    if (!token) {
        return null; // No token found
    }

    try {
        // Decode the token using the secret key
        const decoded = jwt.verify(token, config.jwtSecret) as DecodedToken; // Cast to DecodedToken type
        return decoded.id || null; // Return the user ID or null if not found
    } catch (error) {
        console.error('Token verification failed:', error);
        return null; // Return null if token verification fails
    }
}
