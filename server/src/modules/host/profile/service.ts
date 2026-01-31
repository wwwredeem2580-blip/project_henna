import { User, PhoneVerification, PaymentDetails } from '../../../database/auth/auth';
import CustomError from '../../../utils/CustomError';

interface PaymentDetails {
    method: 'bkash' | 'nagad' | 'rocket' | 'bank_transfer';
    mobileNumber?: string;
    accountHolderName: string;
    bankName?: string;
    accountNumber?: string;
    branchName?: string;
    routingNumber?: string;
    swiftCode?: string;
}


export const getHostProfileService = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  // Check phone verification - only consider verified records matching current phone
  const phoneVerification = await PhoneVerification.findOne({
    userId,
    phoneNumber: user.phoneNumber,
    verified: true
  }).sort({ verifiedAt: -1 });

  // Get payment details
  const paymentDetails = await PaymentDetails.findOne({ userId });

  // Compute profile completion status
  const phoneVerified = !!phoneVerification;
  const paymentConfigured = !!paymentDetails;
  const profileComplete = phoneVerified && paymentConfigured;

  return {
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      businessName: user.businessName,
      businessEmail: user.businessEmail,
      role: user.role,
      emailVerified: user.emailVerified
    },
    phoneVerified,
    phoneVerificationDetails: phoneVerification ? {
      verifiedAt: phoneVerification.verifiedAt,
      phoneNumber: phoneVerification.phoneNumber
    } : null,
    paymentDetails: paymentDetails ? {
      method: paymentDetails.method,
      mobileNumber: paymentDetails.mobileNumber,
      accountHolderName: paymentDetails.accountHolderName,
      bankName: paymentDetails.bankName,
      accountNumber: paymentDetails.accountNumber,
      branchName: paymentDetails.branchName,
      verified: paymentDetails.verified,
      verifiedAt: paymentDetails.verifiedAt
    } : null,
    profileComplete
  };
};

export const updatePaymentDetailsService = async (userId: string, { method, mobileNumber, accountHolderName, bankName, accountNumber, branchName, routingNumber, swiftCode }: PaymentDetails) => {
    // Upsert payment details (replace existing)
    const paymentDetails = await PaymentDetails.findOneAndUpdate(
      { userId },
      {
        method,
        mobileNumber: mobileNumber || undefined,
        accountHolderName,
        bankName: bankName || undefined,
        accountNumber: accountNumber || undefined,
        branchName: branchName || undefined,
        routingNumber: routingNumber || undefined,
        swiftCode: swiftCode || undefined,
        verified: false, // Admin must verify
        verifiedAt: undefined,
        verifiedBy: undefined,
        rejectionReason: undefined,
        lastUpdatedBy: userId
      },
      { upsert: true, new: true }
    )

    return paymentDetails;
};

export const deletePaymentDetailsService = async (userId: string) => {

    await PaymentDetails.deleteOne({ userId });

    return {
      success: true,
      message: 'Payment details deleted successfully'
    };
};
