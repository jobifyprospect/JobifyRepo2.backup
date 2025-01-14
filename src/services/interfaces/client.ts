import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface Client {
  clientId: string | undefined;
  bio?: string;
  userId: string;
  jobsList?: string[]; // List of Job IDs
  createdAt:
  | FirebaseFirestoreTypes.Timestamp
  | FirebaseFirestoreTypes.FieldValue;
  updatedAt:
  | FirebaseFirestoreTypes.Timestamp
  | FirebaseFirestoreTypes.FieldValue;
}
