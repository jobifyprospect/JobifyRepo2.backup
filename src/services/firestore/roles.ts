import {showAlert} from '../../components/AlertDialog';
import {FIRESTORE_DB} from '../../config/firebase';
import {Role} from '../interfaces/role';

const rolesRef = FIRESTORE_DB.collection('roles');

export const createRole = async (role: Role): Promise<void> => {
  try {
    await rolesRef.doc(role.roleId).set(role);
  } catch (error) {
    showAlert('Error', 'Failed to create role.');
    console.error(error);
  }
};

export const getRole = async (roleId: string): Promise<Role | undefined> => {
  try {
    const roleDoc = await rolesRef.doc(roleId).get();
    return roleDoc.exists ? (roleDoc.data() as Role) : undefined;
  } catch (error) {
    showAlert('Error', 'Failed to retrieve role.');
    console.error(error);
    return undefined;
  }
};

export const updateRole = async (
  roleId: string,
  updates: Partial<Role>,
): Promise<void> => {
  try {
    await rolesRef.doc(roleId).update(updates);
  } catch (error) {
    showAlert('Error', 'Failed to update role.');
    console.error(error);
  }
};

export const deleteRole = async (roleId: string): Promise<void> => {
  try {
    await rolesRef.doc(roleId).delete();
  } catch (error) {
    showAlert('Error', 'Failed to delete role.');
    console.error(error);
  }
};
