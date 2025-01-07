import { showAlert } from '../../components/AlertDialog';
import { workersRef } from '../../config/firebase';
import { Worker } from '../interfaces/worker';

export const createWorker = async (worker: Worker): Promise<void> => {
  try {
    await workersRef.doc(worker.workerId).set(worker);
  } catch (error) {
    showAlert('Error', 'Failed to create worker.');
    console.error(error);
  }
};

export const getWorker = async (
  workerId: string,
): Promise<Worker | undefined> => {
  try {
    const workerDoc = await workersRef.doc(workerId).get();
    return workerDoc.exists ? (workerDoc.data() as Worker) : undefined;
  } catch (error) {
    showAlert('Error', 'Failed to retrieve worker.');
    console.error(error);
    return undefined;
  }
};

export const updateWorker = async (
  workerId: string,
  updates: Partial<Worker>,
): Promise<void> => {
  try {
    await workersRef.doc(workerId).update(updates);
  } catch (error) {
    showAlert('Error', 'Failed to update worker.');
    console.error(error);
  }
};

export const deleteWorker = async (workerId: string): Promise<void> => {
  try {
    await workersRef.doc(workerId).delete();
  } catch (error) {
    showAlert('Error', 'Failed to delete worker.');
    console.error(error);
  }
};
