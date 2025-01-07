import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export type BadgeType = 'verified' | 'laundry' | 'woodworker' | 'firstjob' | '5jobs';

// Represents a badge in the Firestore collection
export interface Badge {
  userId: string;
  name: string | undefined;
  description: string;
  createdAt:
  | FirebaseFirestoreTypes.Timestamp
  | FirebaseFirestoreTypes.FieldValue;
  updatedAt:
  | FirebaseFirestoreTypes.Timestamp
  | FirebaseFirestoreTypes.FieldValue;
}
