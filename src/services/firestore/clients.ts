import {showAlert} from '../../components/AlertDialog';
import {clientsRef} from '../../config/firebase';
import {Client} from '../interfaces/client';

export const createClient = async (client: Client): Promise<void> => {
  try {
    await clientsRef.doc(client.clientId).set(client);
  } catch (error) {
    showAlert('Error', 'Failed to create client.');
    console.error(error);
  }
};

export const getClient = async (
  clientId: string,
): Promise<Client | undefined> => {
  try {
    const clientDoc = await clientsRef.doc(clientId).get();
    return clientDoc.exists ? (clientDoc.data() as Client) : undefined;
  } catch (error) {
    showAlert('Error', 'Failed to retrieve client.');
    console.error(error);
    return undefined;
  }
};

export const updateClient = async (
  clientId: string,
  updates: Partial<Client>,
): Promise<void> => {
  try {
    await clientsRef.doc(clientId).update(updates);
  } catch (error) {
    showAlert('Error', 'Failed to update client.');
    console.error(error);
  }
};

export const deleteClient = async (clientId: string): Promise<void> => {
  try {
    await clientsRef.doc(clientId).delete();
  } catch (error) {
    showAlert('Error', 'Failed to delete client.');
    console.error(error);
  }
};
