import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Exports for Firebase services, initialized in one file
export const FIREBASE_APP = firebase.app();
export const FIREBASE_AUTH = auth();
export const FIRESTORE_DB = firestore();
export const FIRESTORE_STORAGE = storage();
export const FIRESTORE_TIMESTAMP =
  firebase.firestore.FieldValue.serverTimestamp();
export const CURRENT_USER_UID = FIREBASE_AUTH.currentUser?.uid;

export const JOBS = FIRESTORE_DB.collection('jobs');
