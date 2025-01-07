import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import { BadgeType } from './badge';

// Represents a worker in the Firestore collection
export interface Worker {
  workerId: string | undefined;
  badges?: BadgeType[];
  userId: string;
  applicationsList?: string[];
  createdAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
  updatedAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
}
