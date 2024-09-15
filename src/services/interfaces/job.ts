import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Job {
  id: string;
  title: string;
  description: string;
  pay: number;
  clientId: string;
  workerId?: string;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}
