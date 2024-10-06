import firebase from '@react-native-firebase/app';
import auth, {onAuthStateChanged} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Exports for Firebase services, initialized in one file
export const FIREBASE_APP = firebase.app();
export const FIREBASE_AUTH = auth();
export const FIRESTORE_DB = firestore();
export const FIRESTORE_STORAGE = storage();
export const FIRESTORE_TIMESTAMP =
  firebase.firestore.FieldValue.serverTimestamp();
export const rolesRef = firestore().collection('roles');
export const usersRef = firestore().collection('users');
// utils.js or wherever you define your utility functions
// utils.js or wherever you define your utility functions
export const getCurrentUserUID = () => {
  return new Promise<string | null>(resolve => {
    const uid = FIREBASE_AUTH.currentUser?.uid; // Get UID

    if (uid) {
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
