import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface TimeRecord {
  id: string;
  jobId: string;
  applicationId?: string;
  workerId?: string;
  clientId?: string;
  acceptedBy?: string;
  acceptedTimeIn?: boolean;
  acceptedTimeOut?: boolean;
  time_in:
  | FirebaseFirestoreTypes.Timestamp
  | FirebaseFirestoreTypes.FieldValue;
  time_out?:
  | FirebaseFirestoreTypes.Timestamp
  | FirebaseFirestoreTypes.FieldValue;
}
