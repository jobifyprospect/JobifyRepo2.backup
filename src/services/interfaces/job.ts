import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Job {
  jobId: string;
  title?: string;
  pay?: number; // Monetary pay
  status?: 'open' | 'closed' | 'pending'; // Possible statuses
  location?: string;
  description?: string;
  createdAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
  updatedAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
  clientId: string; // List of Client IDs
  applicationsList?: string[]; // List of Application IDs
}
