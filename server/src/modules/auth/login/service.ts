import bcrypt from 'bcrypt';
import { User } from '../../../database/auth/auth';
import { generateAccessToken, generateRefreshToken } from '../../../utils/auth/token';
import CustomError from '../../../utils/CustomError';
import { Request, Response } from 'express';
import { loginSchema } from '../../../schema/auth.schema';
import { handleError } from '../../../utils/handleError';
import { ACCESS_TOKEN_CONFIG, REFRESH_TOKEN_CONFIG } from '../../../utils/cookieConfig';
import { addLoginHistoryJob } from '../../../workers/loginHistory.queue';

export const loginService = async (req: Request, res: Response) => {

  try {
    if(!req.body || Object.keys(req.body).length === 0){
      throw new CustomError('Please provide all the required fields', 400);
    }
    const data = loginSchema.parse(req.body);
    
    // Optimized query: only fetch necessary fields
    const user = await User.findOne({ 
      email: data.email,
      provider: 'local' 
    }).select('+password');
    
    if (!user) {
      throw new CustomError('Invalid Credentials', 404);
    }
    
    if (!user.password) {
      throw new CustomError('Invalid Credentials', 401);
    }
    
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new CustomError('Invalid Credentials', 401);
    }

    // --- Async Login History Update ---
    const currentIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'Unknown';
    const currentUserAgent = req.headers['user-agent'] || 'Unknown';

    console.log(`[LOGIN] User: ${user.email}, IP: ${currentIp}`);

    // Queue login history update (non-blocking)
    addLoginHistoryJob({
      userId: user._id.toString(),
      ip: typeof currentIp === 'string' ? currentIp : 'Unknown',
      userAgent: currentUserAgent,
      timestamp: new Date(),
    }).catch(err => {
      console.error('[LOGIN] Failed to queue login history job:', err);
    });
    // --------------------------------------------
    
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
    
    // Only update refresh token (minimal write)
    await User.findByIdAndUpdate(user._id, { 
      refreshToken,
      lastLoginAt: new Date(),
      lastLoginIP: typeof currentIp === 'string' ? currentIp : 'Unknown'
    });
    
    res.cookie('accessToken', accessToken, ACCESS_TOKEN_CONFIG);
    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_CONFIG);
    return res.status(200).json({ 
      message: 'Login successful' 
    });
  } catch (error) {
    handleError(error, res);
  }

};
