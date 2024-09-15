import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Job {
  jobId: string;
  title?: string;
  pay?: number; // Monetary pay
  status?: 'open' | 'closed' | 'pending'; // Possible statuses
  location?: string;
  description?: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
  clientId: string; // List of Client IDs
  applicationsList?: string[]; // List of Application IDs
}
