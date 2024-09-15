import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Application {
  applicationId: string;
  workerId: string; // Reference to a Worker
  jobId: string; // Reference to a Job
  offer: number; // Monetary offer or other terms
  status: 'pending' | 'accepted' | 'rejected';
  reviewId?: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}
