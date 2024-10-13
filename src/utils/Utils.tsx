// TODO VALIDATORS
import {
  FieldValue,
  FirebaseFirestoreTypes,
  Timestamp,
} from '@react-native-firebase/firestore';
import RNFS from 'react-native-fs'; // Required for converting to base64

export const isNotEmpty = (input: string): boolean => {
  if (input === undefined) {
    return false;
  }
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
  if (phoneNumber === undefined) {
    return false;
  }
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

export const convertImageToBase64 = async (
  uri: string,
): Promise<string | null> => {
  try {
    const base64String = await RNFS.readFile(uri, 'base64');
    return `data:image/jpeg;base64,${base64String}`;
  } catch (error) {
    console.error('Error converting image to Base64:', error);
    return null;
  }
};

interface FirebaseTimeStampT extends FirebaseFirestoreTypes.Timestamp {
  seconds: number;
  nanoseconds: number;
}

export function formatDate(date: FirebaseTimeStampT) {
  const newDate = new Date(date.seconds * 1000 + date.nanoseconds / 1000000);

  const formattedDate = newDate.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
  });

  return formattedDate;
}

// Helper function to format the date
export const formatDateToReadable = (date: Timestamp | FieldValue) => {
  if (!date) {
    return;
  }
  const dateStr = date?.toString();
  const dateObj = date instanceof Timestamp ? date.toDate() : new Date(dateStr);

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(dateObj);
};
