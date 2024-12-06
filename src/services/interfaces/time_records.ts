import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface TimeRecord {
  id: string;
  jobId: string;
  applicationId: string;
  workerId: string;
  clientId: string;
  acceptedBy: string;
  time_in: string;
  time_out: string;
}
