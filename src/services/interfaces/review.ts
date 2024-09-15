import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Review {
  reviewId: string;
  applicationId: string; // Reference to an Application
  rating: number; // Rating out of 5
  comment?: string; // Optional comment or feedback
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}
