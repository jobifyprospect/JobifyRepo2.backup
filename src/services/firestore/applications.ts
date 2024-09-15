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

export const getApplication = async (
  applicationId: string,
): Promise<Application | undefined> => {
  try {
    const applicationDoc = await applicationsRef.doc(applicationId).get();
    return applicationDoc.exists
      ? (applicationDoc.data() as Application)
      : undefined;
  } catch (error) {
    showAlert('Error', 'Failed to retrieve application.');
    console.error(error);
    return undefined;
  }
};

export const updateApplication = async (
  applicationId: string,
  updates: Partial<Application>,
): Promise<void> => {
  try {
    await applicationsRef.doc(applicationId).update(updates);
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
