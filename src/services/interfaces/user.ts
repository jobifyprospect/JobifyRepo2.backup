import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface User {
  userId: string;
  firstName?: string;
  lastName?: string;
  fcmToken?: string;
  email?: string | null;
  profilePicture?: string;
  validationId?: string;
  addressId?: string;
  phoneNumber: string;
  defaultRole?: string;
  createdAt:
  | FirebaseFirestoreTypes.Timestamp
  | FirebaseFirestoreTypes.FieldValue;
  updatedAt:
  | FirebaseFirestoreTypes.Timestamp
  | FirebaseFirestoreTypes.FieldValue;
  roleId?: string[];
  notificationIds?: string[];
}
