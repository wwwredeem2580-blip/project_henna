import bcrypt from 'bcrypt';
import { User } from '../../../database/auth/auth';
import { generateAccessToken, generateRefreshToken } from '../../../utils/auth/token';
import CustomError from '../../../utils/CustomError';
import { Request, Response } from 'express';
import { loginSchema } from '../../../schema/auth.schema';
import { handleError } from '../../../utils/handleError';
import { ACCESS_TOKEN_CONFIG, REFRESH_TOKEN_CONFIG } from '../../../utils/cookieConfig';

export const loginService = async (req: Request, res: Response) => {

  try {
    if(!req.body || Object.keys(req.body).length === 0){
      throw new CustomError('Please provide all the required fields', 400);
    }
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email });
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    if (user.provider !== 'local') {
      throw new CustomError('User not found', 404);
    }
    if (!user.password) {
      throw new CustomError('User not found', 404);
    }
    
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new CustomError('Invalid password', 401);
    }
    const accessToken = generateAccessToken({ 
      sub: user._id.toString(), 
      email: user.email, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
    });
    const refreshToken = generateRefreshToken({ 
      sub: user._id.toString(), 
      email: user.email, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
    });
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('accessToken', accessToken, ACCESS_TOKEN_CONFIG);
    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_CONFIG);
    return res.status(200).json({ 
      message: 'Login successful' 
    });
  } catch (error) {
    handleError(error, res);
  }

};
