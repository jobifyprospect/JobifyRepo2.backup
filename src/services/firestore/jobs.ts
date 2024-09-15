import firestore from '@react-native-firebase/firestore';
import {Job} from '../interfaces/job';
import {FIRESTORE_DB} from '../../config/firebase';

const jobsRef = FIRESTORE_DB.collection('jobs');

export const addJob = async (
  jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<void> => {
  try {
    await jobsRef.add({
      ...jobData,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding job: ', error);
  }
};

export const getJobById = async (jobId: string): Promise<Job | undefined> => {
  try {
    const doc = await jobsRef.doc(jobId).get();
    if (doc.exists) {
      return {id: doc.id, ...doc.data()} as Job;
    }
    return undefined;
  } catch (error) {
    console.error('Error getting job: ', error);
    return undefined;
  }
};

export const updateJob = async (
  jobId: string,
  jobData: Partial<Omit<Job, 'id' | 'createdAt'>>,
): Promise<void> => {
  try {
    await jobsRef.doc(jobId).update({
      ...jobData,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating job: ', error);
  }
};

export const deleteJob = async (jobId: string): Promise<void> => {
  try {
    await jobsRef.doc(jobId).delete();
  } catch (error) {
    console.error('Error deleting job: ', error);
  }
};
