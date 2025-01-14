import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface Review {
  reviewId: string;
  applicationId: string; // Reference to an Application
  clientId: string;
  workerId: string;
  jobTitle: string;
  amount: number;
  startDate:
  | FirebaseFirestoreTypes.Timestamp
  | FirebaseFirestoreTypes.FieldValue;
  endDate: FirebaseFirestoreTypes.Timestamp | FirebaseFirestoreTypes.FieldValue;
  rating: number; // Rating out of 5
  comment?: string; // Optional comment or feedback
  createdAt:
  | FirebaseFirestoreTypes.Timestamp
  | FirebaseFirestoreTypes.FieldValue;
  updatedAt:
  | FirebaseFirestoreTypes.Timestamp
  | FirebaseFirestoreTypes.FieldValue;
}

export interface Feedback {
  feedbackId: string;
  workerId: string;
  clientId: string;
  comment: string;
  jobTitle: string;
  rating: number;
  createdAt:
  | FirebaseFirestoreTypes.Timestamp
  | FirebaseFirestoreTypes.FieldValue;
  updatedAt:
  | FirebaseFirestoreTypes.Timestamp
  | FirebaseFirestoreTypes.FieldValue;
}
