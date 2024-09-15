// TODO VALIDATORS

export const isNotEmpty = (input: string): boolean => {
  return input.trim().length >= 3;
};

export const isEmailValid = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const isPasswordValid = (password: string): boolean => {
  return password.length >= 6;
};

export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const cleaned = phoneNumber.replace(/\D+/g, '');

  return /^63\d{10}$/.test(cleaned);
};

export const formatPhoneNumber = (input: string): string => {
  const cleaned = input.replace(/\D+/g, '');

  let formatted = cleaned;
  if (cleaned.startsWith('0')) {
    formatted = `63${cleaned.slice(1)}`;
  }

  const match = formatted.match(/^(\d{2})(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  }

  return `+${formatted}`;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const detectCountryFromPhone = (phoneNumber: string): string => {
  // Placeholder for actual implementation. For now, return 'Philippines' by default.
  return 'Philippines'; // Replace with actual logic
};

export const isPostalCodeValid = (postalCode: string): boolean => {
  const postalCodeRegex = /^\d{4}$/;
  return postalCodeRegex.test(postalCode);
};

export const validatePassword = (password: string) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    hasSpecialChar
  );
};
