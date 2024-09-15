import firestore from '@react-native-firebase/firestore';
import {Role} from '../interfaces/role';
import {FIRESTORE_DB} from '../../config/firebase';

// Firestore collection reference
const rolesRef = FIRESTORE_DB.collection('roles');

// Add a new role
export const addRole = async (
  roleData: Omit<Role, 'roleId' | 'createdAt' | 'updatedAt'>,
): Promise<void> => {
  try {
    await rolesRef.add({
      ...roleData,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding role: ', error);
  }
};

// Get all roles by client ID
export const getRolesByClientId = async (clientId: string): Promise<Role[]> => {
  const snapshot = await rolesRef.where('clientId', '==', clientId).get();
  return snapshot.docs.map(doc => ({
    roleId: doc.id,
    ...doc.data(),
  })) as Role[];
};

// Get all roles by worker ID
export const getRolesByWorkerId = async (workerId: string): Promise<Role[]> => {
  const snapshot = await rolesRef.where('workerId', '==', workerId).get();
  return snapshot.docs.map(doc => ({
    roleId: doc.id,
    ...doc.data(),
  })) as Role[];
};

// Update role data
export const updateRole = async (
  roleId: string,
  roleData: Partial<Role>,
): Promise<void> => {
  try {
    await rolesRef.doc(roleId).update({
      ...roleData,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating role: ', error);
  }
};

// Delete a role
export const deleteRole = async (roleId: string): Promise<void> => {
  try {
    await rolesRef.doc(roleId).delete();
  } catch (error) {
    console.error('Error deleting role: ', error);
  }
};
