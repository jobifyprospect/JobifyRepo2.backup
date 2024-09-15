import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Role {
  roleId: string;
  clientId?: string; // Reference to a Client (if user is a client)
  workerId?: string; // Reference to a Worker (if user is a worker)
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}
