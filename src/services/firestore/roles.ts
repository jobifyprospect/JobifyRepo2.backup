import {showAlert} from '../../components/AlertDialog';
import {FIRESTORE_DB, usersRef, workersRef} from '../../config/firebase';
import {Role} from '../interfaces/role';
import {User} from '../interfaces/user';
import {Worker} from '../interfaces/worker';

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

export const getWorkerFullName = async (
  roleId: string,
): Promise<string | undefined> => {
  try {
    const roleDoc = await rolesRef.doc(roleId).get();
    if (roleDoc.exists) {
      const roleData = roleDoc.data() as Role;
      const workerId = roleData.workerId;
      const workerDoc = await workersRef.doc(workerId).get();
      if (workerDoc.exists) {
        const workerData = workerDoc.data() as Worker;
        const userId = workerData.userId;
        const userDoc = await usersRef.doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data() as User;
          const fullName = `${userData.firstName ?? ''} ${
            userData.lastName ?? ''
          }`.trim();
          return fullName || undefined;
        }
      }
    }
    return undefined;
  } catch (error) {
    showAlert('Error', "Failed to retrieve worker's full name.");
    console.error(error);
    return undefined;
  }
};

export const getWorkerProfilePicture = async (
  roleId: string,
): Promise<string | undefined> => {
  try {
    const roleDoc = await rolesRef.doc(roleId).get();
    if (roleDoc.exists) {
      const roleData = roleDoc.data() as Role;
      const workerId = roleData.workerId;

      const workerDoc = await workersRef.doc(workerId).get();
      if (workerDoc.exists) {
        const workerData = workerDoc.data() as Worker;
        const userId = workerData.userId;
        const userDoc = await usersRef.doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data() as User;
          const profilePicture = userData.profilePicture ?? undefined;
          if (!profilePicture) {
            const firstInitial =
              userData.firstName?.charAt(0).toUpperCase() ?? '';
            const lastInitial =
              userData.lastName?.charAt(0).toUpperCase() ?? '';
            return `${firstInitial}${lastInitial}` || undefined;
          }
          return profilePicture;
        }
      }
    }
    return undefined;
  } catch (error) {
    showAlert('Error', "Failed to retrieve worker's profile picture.");
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
