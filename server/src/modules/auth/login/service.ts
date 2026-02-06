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
      throw new CustomError('Invalid Credentials', 401);
    }
    if (!user.password) {
      throw new CustomError('Invalid Credentials', 401);
    }
    
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new CustomError('Invalid Credentials', 401);
    }

    // --- Security: Suspicious Login Detection ---
    const currentIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'Unknown';
    const currentUserAgent = req.headers['user-agent'] || 'Unknown';

    console.log(`[LOGIN] User: ${user.email}, IP: ${currentIp}`);

    // If history exists, check if this IP is new
    if (user.loginHistory && user.loginHistory.length > 0) {
      const isKnownIp = user.loginHistory.some((entry: any) => entry.ip === currentIp);
      
      if (!isKnownIp) {
        console.warn(`[SECURITY] New IP login detected for ${user.email}: ${currentIp}`);
        
        // Trigger Email Alert
        // We import dynamically to avoid circular dependencies if any
        const { addEmailJob } = await import('../../../workers/email.queue');
        
        await addEmailJob('SUSPICIOUS_LOGIN', {
          name: user.firstName,
          email: user.email,
          time: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }), // Adjust timezone as needed
          ip: typeof currentIp === 'string' ? currentIp : 'Unknown',
          device: currentUserAgent
        });
      }
    }

    // Update Login History
    if (!user.loginHistory) user.loginHistory = [];
    
    user.loginHistory.push({
      ip: typeof currentIp === 'string' ? currentIp : 'Unknown',
      userAgent: currentUserAgent,
      timestamp: new Date()
    });

    // Keep history manageable (last 20 entries)
    if (user.loginHistory.length > 20) {
      user.loginHistory = user.loginHistory.slice(-20);
    }
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
