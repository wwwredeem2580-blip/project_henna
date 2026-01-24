import { Request, Response, NextFunction } from 'express';
import { JwtTokenPayload } from '../types/auth.type';
import { validateAuthorization } from '../utils/validateAuthorization';

declare global {
  namespace Express {
    interface Request {
      user?: JwtTokenPayload;
    }
  }
}

export const requirePublic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.cookies || !req.cookies.accessToken){
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const decoded = validateAuthorization(req.cookies.accessToken, process.env.JWT_ACCESS_TOKEN_SECRET!);
    req.user = decoded;
    if(!req.user || !req.user.sub){
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.user || req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
