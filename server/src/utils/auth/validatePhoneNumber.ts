export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Bangladesh: +880 1X XXXX XXXX (11 digits after country code)
  const bangladeshPattern = /^\+?880[1][3-9]\d{8}$/;
  return bangladeshPattern.test(phoneNumber.replace(/\s+/g, ''));
}