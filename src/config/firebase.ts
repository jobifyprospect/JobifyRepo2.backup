import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import 'firebase/auth';

// Exports for Firebase services, initialized in one file
export const FIREBASE_APP = firebase.app();
export const FIREBASE_AUTH = auth();
export const FIREBASE_AUTH_EMAIL_PROVIDER = firebase.auth.EmailAuthProvider;
export const FIRESTORE_DB = firestore();
export const FIRESTORE_STORAGE = storage();
export const FIRESTORE_TIMESTAMP =
  firebase.firestore.FieldValue.serverTimestamp();
export const rolesRef = FIRESTORE_DB.collection('roles');
export const usersRef = FIRESTORE_DB.collection('users');
export const jobsRef = FIRESTORE_DB.collection('jobs');
export const workersRef = FIRESTORE_DB.collection('workers');
export const addressesRef = FIRESTORE_DB.collection('addresses');
export const validationsRef = FIRESTORE_DB.collection('validations');
export const notificationsRef = FIRESTORE_DB.collection('notifications');
export const applicationsRef = FIRESTORE_DB.collection('applications');
export const timeRecordsRef = FIRESTORE_DB.collection('time_records');
export const clientsRef = FIRESTORE_DB.collection('clients');

// Export Firestore collections
export const JOBS = FIRESTORE_DB.collection('jobs');
