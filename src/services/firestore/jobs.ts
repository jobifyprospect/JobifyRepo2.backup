import {showAlert} from '../../components/AlertDialog';
import {applicationsRef, clientsRef, jobsRef} from '../../config/firebase';
import {Application} from '../interfaces/application';
import {Job} from '../interfaces/job';
import {User} from '../interfaces/user';
import {getCurrentUserUID, getUserDetailsByClientId} from './users';

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

export const queryJobWithUserDetails = async (
  query: string,
): Promise<Array<{job: Job; user: User | null}>> => {
  // Query Firestore for matching jobs
  try {
    const snapshot = await jobsRef
      .where('title', '>=', query)
      .where('title', '<=', query + '\uf8ff') // Range query for title
      .get();

    if (!snapshot.empty) {
      const currentUserId = await getCurrentUserUID(); // Get the current user ID
      const jobsWithUserDetails: Array<{job: Job; user: User | null}> = [];

      const jobPromises = snapshot.docs.map(async doc => {
        const jobData = doc.data() as Job;
        const userData = await getUserDetailsByClientId(jobData.clientId); // Fetch user details using clientId

        // Only include jobs where the userId does not match the current user's ID
        if (userData && userData.userId !== currentUserId) {
          return {job: jobData, user: userData}; // Return job and user data if they match
        }
        return null; // Return null for non-matching jobs
      });

      // Wait for all user details to be fetched
      const results = await Promise.all(jobPromises);

      // Filter out null values from results
      const filteredResults = results.filter(result => result !== null);
      jobsWithUserDetails.push(...filteredResults);

      return jobsWithUserDetails; // Return the jobs along with their respective user details
    } else {
      // No jobs found in Firestore
      return [];
    }
  } catch (error) {
    console.error(
      'Error fetching jobs with user details from Firestore:',
      error,
    );
    showAlert('Error', 'Failed to retrieve jobs from Firestore.');
    return []; // Return an empty array in case of error
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

export const getJobs = async (jobIds: string[]): Promise<Job[] | undefined> => {
  try {
    const querySnapshot = await jobsRef.where('jobId', 'in', jobIds).get();

    if (querySnapshot.empty) {
      return undefined;
    }

    const jobs: Job[] = [];
    querySnapshot.forEach(doc => {
      jobs.push(doc.data() as Job);
    });

    return jobs;
  } catch (error) {
    showAlert('Error', 'Failed to retrieve jobs.');
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

export const updateJobAssignedWorker = async (
  jobId: string,
  workerId: string | undefined, // Worker ID to assign or undefined to remove
): Promise<void> => {
  try {
    await jobsRef.doc(jobId).update({
      assignedWorker: workerId, // Update assignedWorker field
    });
  } catch (error) {
    showAlert('Error', 'Failed to update job.');
    console.error('Error updating job:', error);
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

export function getJobsByClient(userId: string | null): Promise<Job[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const userSnapshot = await clientsRef.where('userId', '==', userId).get();

      if (userSnapshot.empty) {
        resolve([]); // No user found, resolve with an empty array
        return;
      }
      const clientId = userSnapshot.docs[0].data().clientId; // Assuming clientId is stored in user document
      if (!clientId) {
        resolve([]); // No clientId found, resolve with an empty array
        return;
      }

      // Fetch jobs related to the client ID
      const jobsSnapshot = await jobsRef
        .where('clientId', '==', clientId)
        .orderBy('createdAt', 'desc')
        .get();

      const jobs: Job[] = [];
      jobsSnapshot.forEach(doc => {
        jobs.push(doc.data() as Job);
      });

      resolve(jobs); // Resolve with the fetched jobs
    } catch (error) {
      console.error('Error fetching jobs by client:', error);
      reject(error); // Reject on error
    }
  });
}

export function getJobsByWorker(workerId: string | null): Promise<Job[]> {
  console.log(workerId);

  return new Promise((resolve, reject) => {
    if (!workerId) {
      reject('Worker ID is null or invalid');
      return;
    }

    // Step 1: Fetch all applications where the workerId matches and status is accepted or pending
    applicationsRef
      .where('workerId', '==', workerId)
      .where('status', 'in', ['accepted', 'pending'])
      .get()
      .then(async applicationsSnapshot => {
        const jobIds: string[] = [];

        // Step 2: Collect all jobIds from the applications
        applicationsSnapshot.forEach(doc => {
          const applicationData = doc.data() as Application;
          const {jobId} = applicationData;

          // Collect jobId from application data
          if (jobId) {
            jobIds.push(jobId);
          }
        });

        if (jobIds.length === 0) {
          // If no applications are found for this worker, resolve with an empty list
          resolve([]);
          return;
        }

        // Step 3: Fetch jobs corresponding to the jobIds found in the applications
        const jobsSnapshot = await jobsRef.where('jobId', 'in', jobIds).get();

        const jobs: Job[] = [];

        // Step 4: Process the jobs and map them with application IDs
        jobsSnapshot.forEach(doc => {
          const jobData = doc.data() as Job;
          const jobId = doc.id;

          // Add the applicationsList for each job (based on the applications that were fetched)
          jobData.applicationsList = applicationsSnapshot.docs
            .filter(applicationDoc => applicationDoc.data().jobId === jobId)
            .map(applicationDoc => applicationDoc.id); // Get application IDs

          jobs.push(jobData); // Push the job to the jobs array
        });

        resolve(jobs); // Return the list of jobs
      })
      .catch(error => {
        console.error('Error fetching applications or jobs:', error);
        reject(error); // Reject on error
      });
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
    // Get the current user's UID
    const currentUserId = await getCurrentUserUID();

    const jobSnapshot = await jobsRef.orderBy('createdAt', 'desc').get();

    const jobPromises = jobSnapshot.docs.map(async doc => {
      const jobData = doc.data() as Job;
      const userData = await getUserDetailsByClientId(jobData.clientId); // Fetch user details using clientId

      // Filter jobs where userData's userId doesn't matches the current user's ID
      if (userData && userData.userId !== currentUserId) {
        return {job: jobData, user: userData}; // Return job and user data if they match
      }
      return null; // Return null for non-matching jobs
    });

    // Wait for all user details to be fetched
    const results = await Promise.all(jobPromises);

    // Filter out null values from results
    const filteredResults = results.filter(result => result !== null);
    jobsWithUserDetails.push(...filteredResults);
  } catch (error) {
    console.error('Error fetching jobs with user details:', error);
  }

  return jobsWithUserDetails; // Return the jobs along with their respective user details
}
