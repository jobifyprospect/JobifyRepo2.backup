import firestore from '@react-native-firebase/firestore';
import {Client} from '../interfaces/client';
import {FIRESTORE_DB} from '../../config/firebase';

const clientsRef = FIRESTORE_DB.collection('clients');

export const addClient = async (
  clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<void> => {
  try {
    await clientsRef.add({
      ...clientData,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding client: ', error);
  }
};

export const getClientById = async (
  clientId: string,
): Promise<Client | undefined> => {
  try {
    const doc = await clientsRef.doc(clientId).get();
    if (doc.exists) {
      return {id: doc.id, ...doc.data()} as Client;
    }
    return undefined;
  } catch (error) {
    console.error('Error getting client: ', error);
    return undefined;
  }
};

export const updateClient = async (
  clientId: string,
  clientData: Partial<Omit<Client, 'id' | 'createdAt'>>,
): Promise<void> => {
  try {
    await clientsRef.doc(clientId).update({
      ...clientData,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating client: ', error);
  }
};

export const deleteClient = async (clientId: string): Promise<void> => {
  try {
    await clientsRef.doc(clientId).delete();
  } catch (error) {
    console.error('Error deleting client: ', error);
  }
};
