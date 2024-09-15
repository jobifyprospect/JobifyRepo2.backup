import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Address {
  addressId: string;
  city: string;
  province: string;
  region: string;
  postalCode: string;
  country: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}
