'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  countryCode?: string;
  className?: string;
  error?: boolean;
}

/**
 * PhoneInput component with fixed country code prefix
 * For Bangladesh: +880 prefix with 10-digit input
 */
export function PhoneInput({
  value,
  onChange,
  countryCode = '+880',
  className,
  error = false,
  placeholder = '171 234 5678',
  ...props
}: PhoneInputProps) {
  // Extract digits from phone number (remove country code if present)
  const extractDigits = (phoneNumber: string): string => {
    if (!phoneNumber) return '';

    // Remove country code and any non-digit characters
    let digits = phoneNumber.replace(countryCode, '').replace(/\D/g, '');

    // For Bangladesh, ensure we only keep the last 10 digits
    if (digits.length > 10) {
      digits = digits.slice(-10);
    }

    return digits;
  };

  // Combine country code with digits
  const combinePhoneNumber = (digits: string): string => {
    const cleanDigits = digits.replace(/\D/g, '');
    return cleanDigits ? `${countryCode}${cleanDigits}` : '';
  };

  const [digits, setDigits] = useState(() => extractDigits(value));

  // Update digits when value prop changes (for external updates)
  useEffect(() => {
    const newDigits = extractDigits(value);
    if (newDigits !== digits) {
      setDigits(newDigits);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Only allow digits, spaces, and hyphens
    const cleanInput = inputValue.replace(/[^\d\s\-]/g, '');

    // Limit to 10 digits
    const digitOnly = cleanInput.replace(/\D/g, '');
    if (digitOnly.length > 10) {
      return; // Don't update if it would exceed 10 digits
    }

    setDigits(cleanInput);

    // Notify parent with full phone number
    const fullPhoneNumber = combinePhoneNumber(cleanInput);
    onChange(fullPhoneNumber);
  };

  const formatDisplay = (input: string): string => {
    const digitsOnly = input.replace(/\D/g, '');
    if (digitsOnly.length <= 3) return digitsOnly;
    if (digitsOnly.length <= 6) return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3)}`;
    return `${digitsOnly.slice(0, 3)} ${digitsOnly.slice(3, 6)} ${digitsOnly.slice(6)}`;
  };

  return (
    <div className={cn('flex', className)}>
      {/* Country Code Prefix */}
      <div className={cn(
        'flex items-center px-3 py-2 text-sm font-medium text-gray-900 bg-gray-50 border border-r-0 rounded-l-lg',
        error ? 'border-red-300 bg-red-50' : 'border-gray-300'
      )}>
        {countryCode}
      </div>

      {/* Phone Number Input */}
      <input
        {...props}
        type="tel"
        value={formatDisplay(digits)}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={cn(
          'flex-1 px-3 py-2 text-sm border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
          error
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 text-gray-900 placeholder-gray-400',
          props.disabled && 'bg-gray-50 cursor-not-allowed'
        )}
        maxLength={12} // Allow for formatting spaces
      />
    </div>
  );
}
