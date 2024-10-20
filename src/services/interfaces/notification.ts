import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Notification {
  id: string; // Unique identifier for the notification
  title: string; // Title of the notification
  subtitle: string; // Subtitle or description of the notification
  senderId: string;
  receiverId: string;
  createdAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
  updatedAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
  isRead: boolean; // Read status of the notification
}
