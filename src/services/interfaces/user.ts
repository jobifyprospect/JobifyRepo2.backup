import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface User {
  userId: string;
  createdAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
  updatedAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
  roleId?: string;
}
