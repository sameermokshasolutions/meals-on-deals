import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import usermodal from '../userModals/usermodal';
import jwt from 'jsonwebtoken';
import { config } from '../../../config/config';




if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET not set in environment variables');
}


// Handler to register a new user 
export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let {  email, password, contactNumber, role } = req.body;
    if (role == '') {
      role = 'user'
    }
    // Check if the email is already registered
    const existingUser = await usermodal.findOne({ email });
    // Check if the phone number is already registered
    const existingPhone = await usermodal.findOne({ contactNumber });
    if (existingUser) {
      throw createHttpError(409, 'Email already registered');
    }
    if (existingPhone) {
      throw createHttpError(409, 'Phone Number already in Use');
    }

    // Generate a unique user ID for the new user
    const lastUser = await usermodal.findOne().sort({ userId: -1 });
    const userId = lastUser ? lastUser.userId + 1 : 1000;

    // Hash the user's password for secure storage
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user with the provided data and default inactive status
    const user = new usermodal({
      userId,

      email,
      password: hashedPassword,
      contactNumber,
      role,
    });

    // Save the user in the database
    await user.save();

    // Prepare the response data, excluding the password
    const userResponse = user.toObject();
    userResponse.password = '';

    // Generate a JWT token for the authenticated user with a 10-hour expiration
    const token = jwt.sign({ id: userResponse._id }, config.jwtSecret, { expiresIn: '10h' });

    // Set the token as an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict',
      maxAge: 10 * 60 * 60 * 1000 // 10 hours
    });


    // Send a response with the user details and prompt for email verification
    res.status(200).json({
      success: true,
      message: 'User registered successfully',
      data: userResponse,
    });
  } catch (error) {
    next(error); // Pass any error to the error handling middleware
  }
};
