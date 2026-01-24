import { User } from '../../../database/auth/auth';
import CustomError from '../../../utils/CustomError';
import { Request, Response } from 'express';
import { handleError } from '../../../utils/handleError';

export const logoutService = async (req: Request, res: Response) => {
    try {
      const user = await User.findOne({_id: req.user?.sub});
      if(!user){
          throw new CustomError("Not Logged In", 401);
      }
      user.refreshToken = null;
      await user.save();
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(200).json({message: "Logout successful"});
    } catch (error) {
        handleError(error, res);
    }
};