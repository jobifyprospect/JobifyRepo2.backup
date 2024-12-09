import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Job {
  jobId: string;
  title?: string;
  pay?: number; // Monetary pay
  status?: 'open' | 'closed' | 'pending'; // Possible statuses
  schedule: Date | any;
  location?: string;
  rateType?: string
  mapLocation?: {
    latitude: number;
    longitude: number;
  }; // Latitude and longitude for the job location
  description?: string;
  createdAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
  updatedAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
  clientId: string;
  applicationsList?: string[]; // List of Application IDs
  assignedWorker?: string;
}
