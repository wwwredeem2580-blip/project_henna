import { Request, Response } from 'express';
import { handleError } from '../../../utils/handleError';

export const verifyService = async (req: Request, res: Response) => {

  try {

    res.json(req.user);

  } catch (error) {
    return handleError(error, res);
  }

};
