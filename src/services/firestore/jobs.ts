import {showAlert} from '../../components/AlertDialog';
import {FIRESTORE_DB} from '../../config/firebase';
import {Job} from '../interfaces/job';

const jobsRef = FIRESTORE_DB.collection('jobs');

export const createJob = async (job: Job): Promise<void> => {
  try {
    await jobsRef.doc(job.jobId).set(job);
  } catch (error) {
    showAlert('Error', 'Failed to create job.');
    console.error(error);
  }
};

export const getJob = async (jobId: string): Promise<Job | undefined> => {
  try {
    const jobDoc = await jobsRef.doc(jobId).get();
    return jobDoc.exists ? (jobDoc.data() as Job) : undefined;
  } catch (error) {
    showAlert('Error', 'Failed to retrieve job.');
    console.error(error);
    return undefined;
  }
};

export const updateJob = async (
  jobId: string,
  updates: Partial<Job>,
): Promise<void> => {
  try {
    await jobsRef.doc(jobId).update(updates);
  } catch (error) {
    showAlert('Error', 'Failed to update job.');
    console.error(error);
  }
};

export const deleteJob = async (jobId: string): Promise<void> => {
  try {
    await jobsRef.doc(jobId).delete();
  } catch (error) {
    showAlert('Error', 'Failed to delete job.');
    console.error(error);
  }
};
