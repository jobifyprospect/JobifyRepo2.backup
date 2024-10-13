import firebase from '@react-native-firebase/app';
import auth, {onAuthStateChanged} from '@react-native-firebase/auth';
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
export const rolesRef = firestore().collection('roles');
export const usersRef = firestore().collection('users');
export const addressesRef = firestore().collection('addresses');
export const validationsRef = firestore().collection('validations');
export const notificationsRef = firestore().collection('notifications');
// utils.js or wherever you define your utility functions
// utils.js or wherever you define your utility functions
export const getCurrentUserUID = () => {
  return new Promise<string | null>(resolve => {
    const uid = FIREBASE_AUTH.currentUser?.uid; // Get UID

    if (uid) {
      console.log('Current User ID:', uid);

      resolve(uid); // Resolve with UID if available
    } else {
      const unsubscribeAuth = onAuthStateChanged(FIREBASE_AUTH, (user: any) => {
        if (user) {
          resolve(user.uid); // Resolve with UID when user logs in
        } else {
          resolve(null); // Resolve with null if user is logged out
        }
        unsubscribeAuth(); // Cleanup listener
      });
    }
  });
};

// Export Firestore collections
export const JOBS = FIRESTORE_DB.collection('jobs');
