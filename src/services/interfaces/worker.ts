import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Worker {
  id: string;
  name: string;
  jobTitle: string;
  hourlyRate: number;
  availability: boolean;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}
