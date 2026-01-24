import { registerSchema } from '../../../schema/auth.schema';
import { User } from '../../../database/auth/auth';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../../../utils/auth/token';
import { Request, Response } from 'express';
import { handleError } from '../../../utils/handleError';
import CustomError from '../../../utils/CustomError';
import { ACCESS_TOKEN_CONFIG, REFRESH_TOKEN_CONFIG } from '../../../utils/cookieConfig';

export const registerService = async (req: Request, res: Response) => {
  try {
    if(!req.body || Object.keys(req.body).length === 0){
      throw new CustomError('Please provide all the required fields', 400);
    }
    const data = registerSchema.parse(req.body);

    if(data.password !== data.confirmPassword){
      throw new CustomError('Passwords do not match', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if(existingUser){
      throw new CustomError('User already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      role: 'user',
      provider: 'local',
    });
    const accessToken = generateAccessToken({ 
      sub: user._id.toString(), 
      email: user.email, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    const refreshToken = generateRefreshToken({ 
      sub: user._id.toString(), 
      email: user.email, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('accessToken', accessToken, ACCESS_TOKEN_CONFIG);
    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_CONFIG);
    return res.status(201).json({ 
      message: 'Registration successful' 
    });
  } catch (error) {
    handleError(error, res);
  }
};
