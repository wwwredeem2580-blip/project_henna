import { User } from '../../../database/auth/auth';
import CustomError from '../../../utils/CustomError';


export const getHostProfileService = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  return user;
};