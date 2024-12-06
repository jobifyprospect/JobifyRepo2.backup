import { showAlert } from '../../components/AlertDialog';
import { FIRESTORE_DB } from '../../config/firebase';
import { TimeRecord } from '../interfaces/time_records';

const timeRecordsRef = FIRESTORE_DB.collection('time_records');

// Create a time record
export const createAddress = async (time_record: TimeRecord): Promise<void> => {
  try {
    await timeRecordsRef.doc(time_record.id).set(time_record);
  } catch (error) {
    showAlert('Error', 'Failed to create time record.');
    console.error(error);
  }
};

// Read a time record
export const getTimeRecord = async (
  id: string,
): Promise<TimeRecord | null> => {
  try {
    const doc = await timeRecordsRef.doc(id).get();
    return doc.exists ? (doc.data() as TimeRecord) : null;
  } catch (error) {
    showAlert('Error', 'Failed to fetch time record.');
    console.error(error);
    return null;
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

