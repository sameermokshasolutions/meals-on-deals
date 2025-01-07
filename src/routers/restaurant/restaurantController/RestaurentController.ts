
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import restaurantModel from '../models/restaurantModel';
import usermodal from '../../user/userModals/usermodal';
import couponModel from '../../coupens/models/couponModel';

export const registerRestaurant = async (req: any, res: Response, next: NextFunction): Promise<void> => {

  try {

    console.log(req.body);

    const { restaurantName, email, address, password, contact } = req.body;
    const userId = req.user?.id; // Assuming user ID is available in the request object (e.g., via middleware)

    // Check if the email or contact number is already registered
    const existingrestaurant = await restaurantModel.findOne({ email });
    const existingContact = await restaurantModel.findOne({ contact });

    if (existingrestaurant) {
      throw createHttpError(409, 'Email already registered');
    }
    if (existingContact) {
      throw createHttpError(409, 'Contact number already in use');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const barcodeId = await generateUnique8DigitNumber()
    // Create a new restaurant
    const restaurant = new restaurantModel({
      restaurantName,
      email,
      address,
      password: hashedPassword,
      barcodeId,
      contact,
      createdBy: userId, // Store the ID of the user creating the restaurant
    });

    // Save the restaurant to the database
    await restaurant.save();

    // Remove password from the response
    const restaurantResponse = restaurant.toObject();
    restaurantResponse.password = '';

    res.status(201).json({
      success: true,
      message: 'restaurant registered successfully',
      data: restaurantResponse,
    });
  } catch (error) {
    next(error);
  }
};
function generateUnique8DigitNumber() {
  const min = 10000000; // Smallest 8-digit number
  const max = 99999999; // Largest 8-digit number
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// update restauret controller 
export const updateRestaurant = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { restaurantName, email, address, contact } = req.body;
    const userId = req.user?.id;


    // Find the restaurant and ensure the creator is the one updating it
    const restaurant = await restaurantModel.findById(id);
    if (!restaurant) {
      throw createHttpError(404, 'restaurant not found');
    }
    if (restaurant.createdBy.toString() !== userId) {
      throw createHttpError(403, 'You do not have permission to update this restaurant');
    }

    // Update the restaurant details
    restaurant.restaurantName = restaurantName || restaurant.restaurantName;
    restaurant.email = email || restaurant.email;
    restaurant.address = address || restaurant.address;
    restaurant.contact = contact || restaurant.contact;

    await restaurant.save();

    res.status(200).json({
      success: true,
      message: 'restaurant updated successfully',
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};
// delete restaurant Controller 
export const deleteRestaurant = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { restaurantName, email, address, contact } = req.body;
    const userId = req.user?.id// Assuming user ID is available in the request object

    // Find the restaurant and ensure the creator is the one updating it
    const restaurant = await restaurantModel.findById(id);
    if (!restaurant) {
      throw createHttpError(404, 'restaurant not found');
    }

    if (restaurant.createdBy.toString() !== userId) {
      throw createHttpError(403, 'You do not have permission to deactivete restaurant ');
    }

    // Update the restaurant details
    restaurant.restaurantName = restaurantName || restaurant.restaurantName;
    restaurant.email = email || restaurant.email;
    restaurant.address = address || restaurant.address;
    restaurant.contact = contact || restaurant.contact;
    restaurant.active = restaurant.active ? false : true;

    await restaurant.save();
    res.status(200).json({
      success: true,
      message: 'restaurant updated successfully',
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};
export const restaurantInfo = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {

    const { id } = req.params;

    const { restaurantName, email, address, contact } = req.body;
    const userId = req.user?.id// Assuming user ID is available in the request object

    // Find the restaurant and ensure the creator is the one updating it
    const restaurant = await restaurantModel.findById(id);
    if (!restaurant) {
      throw createHttpError(404, 'restaurant not found');
    }
    console.log(restaurant);
    console.log(userId);

    if (restaurant.createdBy.toString() !== userId) {
      throw createHttpError(403, 'You do not have permission to deactivete restaurant ');
    }



    res.status(200).json({
      success: true,
      message: 'restaurant updated successfully',
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
};
export const listRestaurants = async (req: any, res: any, next: NextFunction) => {


  try {
    const userId = req.user?.id; // Ensure user ID is present
    if (!userId) {
      throw createHttpError(401, 'Authentication Failed');
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 10, 1);
    const search = req.query.search || '';

    const query = {
      createdBy: userId,
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
      ],
    };

    const totalRestaurants = await restaurantModel.countDocuments(query);
    const restaurants = await restaurantModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Restaurants fetched successfully',
      data: restaurants,
      total: totalRestaurants,
      page,
      totalPages: Math.ceil(totalRestaurants / limit),
    });
  } catch (error) {
    next(error);
  }
};
export const restaurantUsers = async (req: any, res: any, next: NextFunction) => {
  try {
    const userId = req.user?.id; // Ensure user ID is present
    if (!userId) {
      throw createHttpError(401, 'Authentication Failed');
    }
    const users = await usermodal.find({
      restaurantId: userId,
      role: 'user'
    });
    let dummy = [{
      role: 'User',
      email: 'samsk7774@gmail.com ',
      contactNumber: '1234567890'
    }]
    res.status(200).json({
      success: true,
      data: dummy
    });
  } catch (error) {
    next(error);
  }
};
export const restaurantCoupons = async (req: any, res: any, next: NextFunction) => {
  try {
    const userId = req.user?.id; // Ensure user ID is present
    if (!userId) {
      throw createHttpError(401, 'Authentication Failed');
    }
    const coupons = await couponModel.find({
      restaurantId: userId,
    });
    res.status(200).json({
      success: true,
      data: coupons
    });
  } catch (error) {
    next(error);
  }
};


// list all al testaurent of current looged in user 



