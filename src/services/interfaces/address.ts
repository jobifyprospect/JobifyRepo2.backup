import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Address {
  addressId: string;
  city: string;
  province: string;
  region: string;
  postalCode: string;
  country: string;
  createdAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
  updatedAt:
    | FirebaseFirestoreTypes.Timestamp
    | FirebaseFirestoreTypes.FieldValue;
}
