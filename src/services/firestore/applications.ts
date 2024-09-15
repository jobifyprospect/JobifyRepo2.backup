import firestore from '@react-native-firebase/firestore';
import {Application} from '../interfaces/application';
import {FIRESTORE_DB} from '../../config/firebase';

// Firestore collection reference
const applicationsRef = FIRESTORE_DB.collection('applications');

// Add a new application
export const addApplication = async (
  applicationData: Omit<
    Application,
    'applicationId' | 'createdAt' | 'updatedAt'
  >,
): Promise<void> => {
  try {
    await applicationsRef.add({
      ...applicationData,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding application: ', error);
  }
};

// Get all applications
export const getApplications = async (): Promise<Application[]> => {
  const snapshot = await applicationsRef.get();
  return snapshot.docs.map(doc => ({
    applicationId: doc.id,
    ...doc.data(),
  })) as Application[];
};

// Get applications by worker ID
export const getApplicationsByWorkerId = async (
  workerId: string,
): Promise<Application[]> => {
  const snapshot = await applicationsRef
    .where('workerId', '==', workerId)
    .get();
  return snapshot.docs.map(doc => ({
    applicationId: doc.id,
    ...doc.data(),
  })) as Application[];
};

// Update the status of an application
export const updateApplicationStatus = async (
  applicationId: string,
  status: 'pending' | 'accepted' | 'rejected',
): Promise<void> => {
  try {
    await applicationsRef.doc(applicationId).update({
      status,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating application status: ', error);
  }
};

// Delete an application
export const deleteApplication = async (
  applicationId: string,
): Promise<void> => {
  try {
    await applicationsRef.doc(applicationId).delete();
  } catch (error) {
    console.error('Error deleting application: ', error);
  }
};
