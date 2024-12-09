import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { showAlert } from '../../components/AlertDialog';
import { FIRESTORE_DB } from '../../config/firebase';
import { Application } from '../interfaces/application';

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

export const getApplication = async (
  appId: string,
): Promise<Application | null> => {
  try {
    const snapshot = await applicationsRef.where('applicationId', '==', appId).limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as unknown as Application;
  } catch (error) {
    console.error('Failed to retrieve application:', error);
    return null;
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

export async function hasWorkerApplied(props: {
  workerId: string;
  jobId: string;
}): Promise<{ result: boolean, application?: FirebaseFirestoreTypes.DocumentData | undefined }> {
  const { workerId, jobId } = props;

  try {
    var result;
    const snapShot = await applicationsRef
      .where('workerId', '==', workerId)
      .where('jobId', '==', jobId)
      .get();

    if (snapShot.empty) {
      return { result: false };
    }

    const app = snapShot.docs;
    result = true;

    const results = {
      result,
      application: app
    }

    return results;
  } catch (error) {
    return {
      result: false
    };
  }
}

export const updateApplication = async (
  applicationId: string,
  updates: Partial<Application>,
): Promise<void> => {
  try {
    await applicationsRef.doc(applicationId).update(updates);
    showAlert(`Application ${updates.status}`, '');
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
