import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Client {
  clientId: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  validationId?: string;
  addressId?: string;
  phoneNumber: string;
  jobsList?: string[]; // List of Job IDs
  createdAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
  updatedAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
}
