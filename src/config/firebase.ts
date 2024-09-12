import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Exports for Firebase services, initialized in one file
export const FIREBASE_APP = firebase.app();
export const FIREBASE_AUTH = auth();
export const FIRESTORE_DB = firestore();
