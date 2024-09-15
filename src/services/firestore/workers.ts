// src/services/firestore/workers.ts

import firestore from '@react-native-firebase/firestore';
import {Worker} from '../interfaces/worker';
import {FIRESTORE_DB} from '../../config/firebase';

const workersRef = FIRESTORE_DB.collection('workers');

export const addWorker = async (
  workerData: Omit<Worker, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<void> => {
  try {
    await workersRef.add({
      ...workerData,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding worker: ', error);
  }
};

export const getWorkerById = async (
  workerId: string,
): Promise<Worker | undefined> => {
  try {
    const doc = await workersRef.doc(workerId).get();
    if (doc.exists) {
      return {id: doc.id, ...doc.data()} as Worker;
    }
    return undefined;
  } catch (error) {
    console.error('Error getting worker: ', error);
    return undefined;
  }
};

export const updateWorker = async (
  workerId: string,
  workerData: Partial<Omit<Worker, 'id' | 'createdAt'>>,
): Promise<void> => {
  try {
    await workersRef.doc(workerId).update({
      ...workerData,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating worker: ', error);
  }
};

export const deleteWorker = async (workerId: string): Promise<void> => {
  try {
    await workersRef.doc(workerId).delete();
  } catch (error) {
    console.error('Error deleting worker: ', error);
  }
};
