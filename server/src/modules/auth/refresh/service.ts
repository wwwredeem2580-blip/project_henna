import { User } from '../../../database/auth/auth';
import CustomError from '../../../utils/CustomError';
import { generateAccessToken, generateRefreshToken } from '../../../utils/auth/token';
import { Request, Response } from 'express';
import { handleError } from '../../../utils/handleError';
import { validateAuthorization } from '../../../utils/validateAuthorization';
import { ACCESS_TOKEN_CONFIG, REFRESH_TOKEN_CONFIG } from '../../../utils/cookieConfig';

export const refreshService = async (req: Request, res: Response) => {
    try {

      if(!req.cookies || !req.cookies.refreshToken){
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const data = validateAuthorization(req.cookies.refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET || "");
      const user = await User.findOne({_id: data.sub, refreshToken: req.cookies.refreshToken});
      if(!user){
          throw new CustomError("Not authorized", 401);
      }
      const tokenPayload = {
          sub: user._id.toString(),
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
      };
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);
      user.refreshToken = refreshToken;
      await user.save();
      res.cookie('accessToken', accessToken, ACCESS_TOKEN_CONFIG);
      res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_CONFIG);
      return res.status(200).json({message: "Refresh successful"});

    } catch (error) {
        handleError(error, res);
    }
};
