import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

// Represents a worker in the Firestore collection
export interface Worker {
  workerId: string | undefined;
  userId: string;
  applicationsList?: string[];
  createdAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
  updatedAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
}
