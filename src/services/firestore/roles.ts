import {showAlert} from '../../components/AlertDialog';
import {
  clientsRef,
  FIRESTORE_DB,
  usersRef,
  workersRef,
} from '../../config/firebase';
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

export const getRole = async (
  roleId: string | undefined,
): Promise<Role | undefined> => {
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
  workerId: string,
): Promise<string | undefined> => {
  try {
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
    return undefined;
  } catch (error) {
    showAlert('Error', "Failed to retrieve worker's full name.");
    console.error(error);
    return undefined;
  }
};

export const getClientFullName = async (
  clientId: string,
): Promise<string | undefined> => {
  try {
    const clientDoc = await clientsRef.doc(clientId).get();
    if (clientDoc.exists) {
      const clientData = clientDoc.data() as Worker;
      const userId = clientData.userId;
      const userDoc = await usersRef.doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data() as User;
        const fullName = `${userData.firstName ?? ''} ${
          userData.lastName ?? ''
        }`.trim();
        return fullName || undefined;
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
  workerId: string,
): Promise<string | undefined> => {
  try {
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
          const lastInitial = userData.lastName?.charAt(0).toUpperCase() ?? '';
          return `${firstInitial}${lastInitial}` || undefined;
        }
        return profilePicture;
      }
    }
    return undefined;
  } catch (error) {
    showAlert('Error', "Failed to retrieve worker's profile picture.");
    console.error(error);
    return undefined;
  }
};

export const getClientProfilePicture = async (
  clientId: string,
): Promise<string | undefined> => {
  try {
    const clientDoc = await clientsRef.doc(clientId).get();
    if (clientDoc.exists) {
      const clientData = clientDoc.data() as Worker;
      const userId = clientData.userId;
      const userDoc = await usersRef.doc(userId).get();
      if (userDoc.exists) {
        const userData = userDoc.data() as User;
        const profilePicture = userData.profilePicture ?? undefined;
        if (!profilePicture) {
          const firstInitial =
            userData.firstName?.charAt(0).toUpperCase() ?? '';
          const lastInitial = userData.lastName?.charAt(0).toUpperCase() ?? '';
          return `${firstInitial}${lastInitial}` || undefined;
        }
        return profilePicture;
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

export const getWorkerIdByRoleId = async (roleId: string) => {
  try {
    const roleDoc = await rolesRef // Replace 'roles' with your Firestore collection name
      .doc(roleId)
      .get();

    if (roleDoc.exists) {
      const roleData = roleDoc.data();
      return roleData?.workerId;
    } else {
      throw new Error('Role not found');
    }
  } catch (error) {
    showAlert('Error', 'Failed to find worker id.');
    console.error(error);
  }
};
