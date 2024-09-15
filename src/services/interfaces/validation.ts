import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Validation {
  validationId: string;
  governmentIdImage: string;
  selfieImage: string;
  isAccountVerified: boolean;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}
