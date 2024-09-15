import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface User {
  userId: string;
  email?: string;
  password?: string; // Be cautious with storing passwords
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
  roleId?: string; // Reference to a Role
}
