import {showAlert} from '../../components/AlertDialog';
import {FIRESTORE_DB} from '../../config/firebase';
import {Job} from '../interfaces/job';
import {User} from '../interfaces/user';
import {getUserDetailsByClientId} from './users';

export const jobsRef = FIRESTORE_DB.collection('jobs');

export const createJob = async (job: Job): Promise<void> => {
  try {
    await jobsRef.doc(job.jobId).set(job);
  } catch (error) {
    showAlert('Error', 'Failed to create job.');
    console.error(error);
  }
};

export const queryJob = async (query: any): Promise<Job | any> => {
  // Query Firestore for matching jobs
  try {
    const snapshot = await jobsRef
      .where('title', '>=', query)
      .where('title', '<=', query + '\uf8ff') // Range query for title
      .get();

    if (!snapshot.empty) {
      const firestoreJobs: Job[] = [];
      snapshot.forEach(doc => {
        firestoreJobs.push(doc.data() as Job);
      });
      return firestoreJobs;
    } else {
      // No jobs found in Firestore
      return [];
    }
  } catch (error) {
    console.error('Error fetching jobs from Firestore:', error);
    showAlert('Error', 'Failed to retrieve jobs from Firestore.');
  }
};

//for search only
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

// Update this to return the unsubscribe function and allow fetching jobs
export function getJobsByClient(clientId: string): Promise<Job[]> {
  return new Promise((resolve, reject) => {
    const unsubscribe = jobsRef
      .where('clientId', '==', clientId)
      .orderBy('createdAt', 'asc')
      .onSnapshot(
        snapshot => {
          const jobs: Job[] = [];
          snapshot.forEach(doc => {
            jobs.push(doc.data() as Job);
          });
          resolve(jobs); // Resolve with the fetched jobs
        },
        error => {
          console.error('Error getting documents:', error);
          reject(error); // Reject on error
        },
      );

    // Return the unsubscribe function to be used in the cleanup
    return () => unsubscribe();
  });
}

export function getAllJobs(): Promise<Job[]> {
  return new Promise((resolve, reject) => {
    const unsubscribe = jobsRef
      .orderBy('createdAt', 'asc') // Order by the creation date
      .onSnapshot(
        snapshot => {
          const jobs: Job[] = [];
          snapshot.forEach(doc => {
            jobs.push(doc.data() as Job);
          });
          resolve(jobs); // Resolve with the fetched jobs
        },
        error => {
          console.error('Error getting documents:', error);
          reject(error); // Reject on error
        },
      );

    // Return the unsubscribe function to be used in the cleanup
    return () => unsubscribe();
  });
}

// Main function to get all jobs with client user details
export async function getAllJobsWithUserDetails(): Promise<
  Array<{job: Job; user: User | null}>
> {
  const jobsWithUserDetails: Array<{job: Job; user: User | null}> = [];

  try {
    const jobSnapshot = await jobsRef.orderBy('createdAt', 'asc').get();

    const jobPromises = jobSnapshot.docs.map(async doc => {
      const jobData = doc.data() as Job;
      const userData = await getUserDetailsByClientId(jobData.clientId); // Fetch user details using clientId
      return {job: jobData, user: userData}; // Return job and user data
    });

    // Wait for all user details to be fetched
    const results = await Promise.all(jobPromises);
    jobsWithUserDetails.push(...results);
  } catch (error) {
    console.error('Error fetching jobs with user details:', error);
  }

  return jobsWithUserDetails; // Return the jobs along with their respective user details
}
