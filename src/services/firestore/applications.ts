import {showAlert} from '../../components/AlertDialog';
import {FIRESTORE_DB} from '../../config/firebase';
import {Application} from '../interfaces/application';

const applicationsRef = FIRESTORE_DB.collection('applications');

export const createApplication = async (
  application: Application,
): Promise<void> => {
  try {
    await applicationsRef.doc(application.applicationId).set(application);
  } catch (error) {
    showAlert('Error', 'Failed to create application.');
    console.error(error);
  }
};

export const getApplicationsByJobId = async (
  jobId: string,
): Promise<Application[] | undefined> => {
  try {
    const snapshot = await applicationsRef.where('jobId', '==', jobId).get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => doc.data() as Application);
  } catch (error) {
    showAlert('Error', 'Failed to retrieve application.');
    console.error(error);
    return [];
  }
};

export const getApplicationsByWorkerId = async (
  workerId: string,
): Promise<Application[]> => {
  try {
    const querySnapshot = await applicationsRef
      .where('workerId', '==', workerId)
      .get();

    if (!querySnapshot.empty) {
      return querySnapshot.docs.map(doc => doc.data() as Application);
    } else {
      return [];
    }
  } catch (error) {
    showAlert('Error', 'Failed to retrieve applications.');
    console.error(error);
    return [];
  }
};

type hasAppliedT = {
  workerId: string;
  jobId: string;
};

export async function hasWorkerApplied(props: hasAppliedT): Promise<boolean> {
  const {workerId, jobId} = props;

  try {
    var result;
    const snapShot = await applicationsRef
      .where('workerId', '==', workerId)
      .where('jobId', '==', jobId)
      .get();

    if (snapShot.empty) {
      result = false;
      return result;
    }

    result = true;
    return result;
  } catch (error) {
    return false;
  }
}

export const updateApplication = async (
  applicationId: string,
  updates: Partial<Application>,
): Promise<void> => {
  try {
    await applicationsRef.doc(applicationId).update(updates);
    showAlert('Application Accepted', '');
  } catch (error) {
    showAlert('Error', 'Failed to update application.');
    console.error(error);
  }
};

export const deleteApplication = async (
  applicationId: string,
): Promise<void> => {
  try {
    await applicationsRef.doc(applicationId).delete();
  } catch (error) {
    showAlert('Error', 'Failed to delete application.');
    console.error(error);
  }
};
