import { Request, Response, Router } from "express";
import CustomError from "../../../utils/CustomError";
import { getHostProfileService, updatePaymentDetailsService, deletePaymentDetailsService } from "./service";
import { handleError } from "../../../utils/handleError";

const router = Router();

// Get host profile with verification status
router.get('/', async (req: Request, res: Response) => {
  try {
    if(!req.user) {
        throw new CustomError('User not found', 404);
    }
    
    const userId = req.user?.sub;
    const result = await getHostProfileService(userId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

// Update payment details
router.post('/payment', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { 
      method, 
      mobileNumber, 
      accountHolderName,
      bankName,
      accountNumber,
      branchName,
      routingNumber,
      swiftCode
    } = req.body;
    
    if (!userId) {
      throw new CustomError('Unauthorized', 401);
    }

    if (!method || !['bkash', 'nagad', 'rocket', 'bank_transfer'].includes(method)) {
      throw new CustomError('Invalid payment method', 400);
    }

    // Validate required fields based on method
    if (['bkash', 'nagad', 'rocket'].includes(method)) {
      if (!mobileNumber || !accountHolderName) {
        throw new CustomError('Mobile number and account holder name are required', 400);
      }
    } else if (method === 'bank_transfer') {
      if (!bankName || !accountNumber || !accountHolderName) {
        throw new CustomError('Bank name, account number, and account holder name are required', 400);
      }
    }

    const paymentDetails = await updatePaymentDetailsService(userId, { method, mobileNumber, accountHolderName, bankName, accountNumber, branchName, routingNumber, swiftCode });

    res.status(200).json({
      success: true,
      message: 'Payment details updated successfully',
      paymentDetails
    });
  } catch (error: any) {
    return handleError(error, res);
  }
});

// Delete payment details
router.delete('/payment', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
        throw new CustomError('Unauthorized', 401);
    }
    const result = await deletePaymentDetailsService(userId);
    res.status(200).json(result);
  } catch (error: any) {
    return handleError(error, res);
  }
});

export default router;