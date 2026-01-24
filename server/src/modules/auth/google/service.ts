import { User } from '../../../database/auth/auth';
import CustomError from '../../../utils/CustomError';
import { generateAccessToken, generateRefreshToken } from '../../../utils/auth/token';
import { GoogleClient } from '../../../utils/auth/google';
import axios from 'axios';
import { handleError } from '../../../utils/handleError';
import { Request, Response } from 'express';
import { ACCESS_TOKEN_CONFIG, REFRESH_TOKEN_CONFIG } from '../../../utils/cookieConfig';

export const getGoogleLoginUrlService = async (req: Request, res: Response) => {

  try {
    const url = GoogleClient.generateAuthUrl({
    access_type: 'offline',
    scope: 'profile email',
  });

    return res.status(200).json({ url });
  } catch (error) {
    handleError(error, res);
  }

};

export const redirectGoogleLoginService = async (req: Request, res: Response) => {

  const { code } = req.query;
  if(!code || typeof code !== 'string') throw new CustomError("Google login failed", 500)

  try {
    const { tokens } = await GoogleClient.getToken(code);
    if (!tokens?.access_token) throw new CustomError("Google token exchange failed", 500)

    const response:any = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokens.access_token}`)
    const data = response?.data

    if(!data.email) throw new CustomError("Google login failed", 500)

    const user = await User.findOne({ email: data?.email })

    if (!user) {
      // User doesn't exist - must register first
      return res.status(404).json({
        success: false,
        message: 'No account found. Please complete registration first.',
        redirectTo: '/auth?tab=signup',
        email: data?.email // Pass email to pre-fill registration
      });
    }

    // If user exists but registered with local provider, link Google account
    if (user.provider === 'local' && !user.googleId) {
      user.googleId = data?.id;
      user.provider = 'google';
      user.photo = data?.picture;
      await user.save();
    }
    
    // If user has Google ID but it doesn't match, this is a different Google account
    if (user.googleId && user.googleId !== data?.id) {
      return res.status(400).json({
        success: false,
        message: 'This email is associated with a different Google account'
      });
    }

    const tokenPayload = {
      sub: user?._id.toString(),
      email: user?.email,
      role: user?.role,
      firstName: user?.firstName,
      lastName: user?.lastName,
    }

    const accessToken = generateAccessToken(tokenPayload)
    const refreshToken = generateRefreshToken(tokenPayload)

    await User.updateOne({ _id: user?._id }, { refreshToken })
    res.cookie('accessToken', accessToken, ACCESS_TOKEN_CONFIG);
    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_CONFIG);
    return res.status(200).json({message: "Login successful"});
  } catch (error) {
    handleError(error, res);
  }

};

