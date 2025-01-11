import restaurantModel, { restaurant } from './../../restaurant/models/restaurantModel';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import usermodal from '../userModals/usermodal';
import jwt from 'jsonwebtoken';
import { config } from '../../../config/config';
import sendEmail from '../../../utils/sendEmail';
import OtpModel from '../../../models/otpModel';
import otpModel from '../../../models/otpModel';
import { log } from 'console';



if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET not set in environment variables');
}

// Generate OTP
function createOTP() {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const hashOtp = bcrypt.hashSync(otp, 10);
  console.log("[OTP]", otp);
  console.log("[OTP]", hashOtp);
  return { otp, hashOtp };
}

// OTP Verification
export const generateOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    let { email, password, contactNumber, role } = req.body;

    if (!email || email === '') {
      throw createHttpError(500, 'Email not found');
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

    const otp = createOTP();

    console.log("email", email);

    await OtpModel.create({
      email,
      otp: otp.hashOtp,
    })

    await sendEmail({
      email: email,
      otp: otp.otp,
    });

    res.status(200).json({
      success: true,
      message: 'OTP Sent Successfully',
    });

  } catch (error) {
    next(error); // Pass any error to the error handling middleware
  }
}

// Handler to register a new user 
export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let { email, password, contactNumber, role, userOTP } = req.body;


    // OTP Verification
    const allMatchingOtps = await OtpModel.find({ email });
    const otpRecord = allMatchingOtps.pop();

    if (!allMatchingOtps || !otpRecord) {
      throw createHttpError(410, 'OTP has expired');
    }

    const isValid = await bcrypt.compare(userOTP, otpRecord.otp);

    if (!isValid) {
      throw createHttpError(400, 'OTP is invalid');
    }

    await otpModel.deleteOne({ _id: otpRecord._id });

    if (role == '') {
      role = 'user'
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
export const addLogo = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { logoUrl } = req.body;
    const restaurantId = req.user?.id;

    if (logoUrl === '') {
      throw createHttpError(409, 'Invalid URL');
    }

    const existingUser = await restaurantModel.findOne({ _id: restaurantId });
    if (!existingUser) {
      throw createHttpError(404, 'Restaurant not found');
    }

    const updateResult = await restaurantModel.updateOne(
      { _id: restaurantId },
      { logoUrl }
    );

    if (updateResult.modifiedCount === 0) {
      throw createHttpError(409, 'Logo update failed');
    }

    res.status(200).json({
      success: true,
      message: 'Logo added successfully'
    });
  } catch (error) {
    next(error);
  }
};

