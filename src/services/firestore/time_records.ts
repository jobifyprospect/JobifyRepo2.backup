import { showAlert } from '../../components/AlertDialog';
import { FIRESTORE_DB } from '../../config/firebase';
import { TimeRecord } from '../interfaces/time_records';

const timeRecordsRef = FIRESTORE_DB.collection('time_records');

// Create a time record
export const createRecord = async (time_record: TimeRecord): Promise<void> => {
  try {
    await timeRecordsRef.doc(time_record.id).set(time_record);
  } catch (error) {
    showAlert('Error', 'Failed to create time record.');
    console.error(error);
  }
};

export const updateRecord = async (
  updates: Partial<TimeRecord>,
  id?: string,
): Promise<void> => {
  try {
    await timeRecordsRef.doc(id).update(updates);
  } catch (error) {
    showAlert('Error', 'Failed to update time record.');
    console.error(error);
  }
};

// Read a time record
export const getTimeRecord = async (
  jobId: string,
  workerId?: string
): Promise<TimeRecord | null> => {
  try {
    const querySnapshot = await timeRecordsRef
      .where('jobId', '==', jobId)
      .where('workerId', '==', workerId)
      .get();

    // Check if any documents were found
    if (querySnapshot.empty) {
      console.log('no results')
      return null; // Return empty array if no documents found
    }

    // Loop through documents and extract data
    const timeRecord = querySnapshot.docs.map((doc) => doc.data() as TimeRecord);
    return timeRecord[0];
  } catch (error) {
    showAlert('Error', 'Failed to search time records.');
    console.error(error);
    return null; // Return empty array on error
  }
};

// Get All time records
export const getAllTimeRecords = async (
  workerId: string,
  jobId: string,
): Promise<TimeRecord[]> => {
  try {
    const querySnapshot = await timeRecordsRef
      .where('workerId', '==', workerId)
      .where('jobId', '==', jobId)
      .get();

    // Check if any documents were found
    if (querySnapshot.empty) {
      return []; // Return empty array if no documents found
    }

    // Loop through documents and extract data
    const timeRecords = querySnapshot.docs.map((doc) => doc.data() as TimeRecord);
    return timeRecords;
  } catch (error) {
    showAlert('Error', 'Failed to search time records.');
    console.error(error);
    return []; // Return empty array on error
  }
};

export const getAll = async (
): Promise<TimeRecord[]> => {
  try {
    const querySnapshot = await timeRecordsRef.get();

    // Check if any documents were found
    if (querySnapshot.empty) {
      return []; // Return empty array if no documents found
    }

    // Loop through documents and extract data
    const timeRecords = querySnapshot.docs.map((doc) => doc.data() as TimeRecord);
    return timeRecords;
  } catch (error) {
    showAlert('Error', 'Failed to search time records.');
    console.error(error);
    return []; // Return empty array on error
  }
};

// Get All time records (per specific worker applications.)
export const getTimeRecordsByApplications = async (
  workerId: string,
  jobId: string,
  applicationId: string
): Promise<TimeRecord[]> => {
  try {
    const querySnapshot = await timeRecordsRef
      .where('workerId', '==', workerId)
      .where('jobId', '==', jobId)
      .where('applicationId', '==', applicationId)
      .get();

    // Check if any documents were found
    if (querySnapshot.empty) {
      return []; // Return empty array if no documents found
    }

    // Loop through documents and extract data
    const timeRecords = querySnapshot.docs.map((doc) => doc.data() as TimeRecord);
    return timeRecords;
  } catch (error) {
    showAlert('Error', 'Failed to search time records.');
    console.error(error);
    return []; // Return empty array on error
  }
};

