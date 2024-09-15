import {showAlert} from '../../components/AlertDialog';
import {FIRESTORE_DB} from '../../config/firebase';
import {User} from '../interfaces/user';

const usersRef = FIRESTORE_DB.collection('users');

export const createUser = async (user: User): Promise<void> => {
  try {
    await usersRef.doc(user.userId).set(user);
  } catch (error) {
    showAlert('Error', 'Failed to create user.');
    console.error(error);
  }
};

export const getUser = async (userId: string): Promise<User | undefined> => {
  try {
    const userDoc = await usersRef.doc(userId).get();
    return userDoc.exists ? (userDoc.data() as User) : undefined;
  } catch (error) {
    showAlert('Error', 'Failed to retrieve user.');
    console.error(error);
    return undefined;
  }
};

export const updateUser = async (
  userId: string,
  updates: Partial<User>,
): Promise<void> => {
  try {
    await usersRef.doc(userId).update(updates);
  } catch (error) {
    showAlert('Error', 'Failed to update user.');
    console.error(error);
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await usersRef.doc(userId).delete();
  } catch (error) {
    showAlert('Error', 'Failed to delete user.');
    console.error(error);
  }
};
