import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Validation {
  validationId: string;
  governmentIdImageFront: string;
  governmentIdImageBack: string;
  selfieImage: string;
  isAccountVerified: boolean;
  createdAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
  updatedAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
}
