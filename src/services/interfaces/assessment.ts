import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

interface Question {
  id: string;
  text: string;
  options: string[];
  answer: number; // Index of the correct answer in the options array
}

// Represents an Assessment in the Firestore collection
export interface Assessment {
  assessmentId: string;
  title: string | undefined;
  description: string;
  questions: Question[]
  createdAt:
  | FirebaseFirestoreTypes.Timestamp
  | FirebaseFirestoreTypes.FieldValue;
  updatedAt:
  | FirebaseFirestoreTypes.Timestamp
  | FirebaseFirestoreTypes.FieldValue;
}
