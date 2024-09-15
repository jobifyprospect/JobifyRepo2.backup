import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

// Represents a worker in the Firestore collection
export interface Worker {
  workerId: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
  applicationsList?: string[];
}
