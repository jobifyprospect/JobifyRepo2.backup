import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Address {
  addressId: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}
