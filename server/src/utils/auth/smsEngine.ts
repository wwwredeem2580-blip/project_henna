
import axios from "axios";
import CustomError from "../CustomError";

interface SMSResponse {
  status: number;
  message: string;
}

export const sendSMS = async (phoneNumber: string, message: string): Promise<SMSResponse> => {
  try {
    let cleanPhone = phoneNumber.replace(/\s+/g, ''); // Remove spaces

    console.log('Original phone number:', phoneNumber);
    console.log('Cleaned phone number:', cleanPhone);

    // If it starts with +880, remove the +880 to get format like 017xxxxxxxx
    if (cleanPhone.startsWith('+880')) {
      cleanPhone = cleanPhone.substring(4); // Remove +880
    } else if (cleanPhone.startsWith('880')) {
      cleanPhone = cleanPhone.substring(3); // Remove 880
    }

    // Ensure it starts with 0 if it doesn't already
    if (!cleanPhone.startsWith('0')) {
      cleanPhone = '0' + cleanPhone;
    }

    console.log('Final formatted phone number:', cleanPhone);

    const formData = new URLSearchParams();
    formData.append('to', cleanPhone);
    formData.append('message', message);
    formData.append('token', process.env.BDBULKSMS_TOKEN!);

    const response = await axios.post('https://api.bdbulksms.net/api.php?json', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000 // 10 second timeout
    });

    const data = response.data as SMSResponse;

    // Debug: Log the actual response to understand the format
    console.log('BDBulkSMS Response:', JSON.stringify(data, null, 2));

    if (data.status !== undefined && data.status !== 0 && data.status !== 1 && data.status !== 200) {
      throw new CustomError(`SMS sending failed: ${data.message || 'Unknown error'} (Status: ${data.status})`, 500);
    }

    return data;
  } catch (error: any) {
    console.error('SMS Service Error:', error);

    if (error instanceof CustomError) {
      throw error;
    }

    if (error.response) {
      if (error.response.data?.message) {
        throw new CustomError(`SMS API error: ${error.response.data.message}`, 500);
      }
      throw new CustomError(`SMS API error: ${error.response.status}`, 500);
    } else if (error.request) {
      throw new CustomError('SMS service unavailable', 503);
    } else {
      throw new CustomError('SMS sending failed', 500);
    }
  }
}