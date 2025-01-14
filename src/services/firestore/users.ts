import { onAuthStateChanged } from '@react-native-firebase/auth';
import { showAlert } from '../../components/AlertDialog';
import {
  addressesRef,
  FIREBASE_AUTH,
  rolesRef,
  usersRef,
  validationsRef,
} from '../../config/firebase';
import { Address } from '../interfaces/address';
import { Role } from '../interfaces/role';
import { User } from '../interfaces/user';
import { UserDetails } from '../interfaces/userDetails';
import { Validation } from '../interfaces/validation';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

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

export const getUser2 = async (clientId: string): Promise<User | undefined> => {
  try {
    const user = await usersRef
      .where('roleId', '==', clientId) // Query using clientId directly
      .limit(1)
      .get();

    return user.docs as unknown as User;
  } catch (error) {
    showAlert('Error', 'Failed to retrieve user.');
    console.error(error);
    return undefined;
  }
};

export const getUserDetails = async (
  userId: string,
): Promise<Array<UserDetails> | undefined> => {
  try {
    const userDoc = await usersRef.doc(userId).get();
    const user = userDoc.exists ? (userDoc.data() as User) : null;

    if (!user) {
      showAlert('Error', 'User not found.');
      return undefined;
    }

    // Fetch related details concurrently using Promise.all
    const [validationDoc, addressDoc, roleDocs] = await Promise.all([
      user.validationId
        ? validationsRef.doc(user.validationId).get()
        : Promise.resolve(null),
      user.addressId
        ? addressesRef.doc(user.addressId).get()
        : Promise.resolve(null),
      user.roleId && user.roleId.length > 0
        ? Promise.all(user.roleId.map(roleId => rolesRef.doc(roleId).get()))
        : Promise.resolve([]),
    ]);

    const validation = validationDoc?.exists
      ? (validationDoc.data() as Validation)
      : null;
    const address = addressDoc?.exists ? (addressDoc.data() as Address) : null;
    const roles =
      roleDocs.length > 0
        ? roleDocs.map(roleDoc => roleDoc.data() as Role)
        : [];

    // Return the data in the specified structure
    return [
      {
        validation,
        address,
        role: roles.length > 0 ? roles[0] : null, // Assuming you're interested in the first role only
        user,
      },
    ];
  } catch (error) {
    showAlert('Error', 'Failed to retrieve user details.');
    console.error('Error fetching user details:', error);
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

export const updateUserDetails = async (
  userId: string,
  updates: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    address?: {
      region: string;
      province: string;
      city: string;
      postalCode: string;
    };
  },
): Promise<void> => {
  try {
    const userDoc = await usersRef.doc(userId).get();
    const user = userDoc.data();

    if (!user) {
      showAlert('Error', 'User not found.');
      return;
    }

    // Update address if provided
    if (updates.address && user.addressId) {
      await addressesRef.doc(user.addressId).update({
        region: updates.address.region,
        province: updates.address.province,
        city: updates.address.city,
        postalCode: updates.address.postalCode,
      });
    }

    // Prepare user updates for first name, last name, phone number
    const userUpdates: Partial<User> = {};
    if (updates.firstName) {
      userUpdates.firstName = updates.firstName;
    }
    if (updates.lastName) {
      userUpdates.lastName = updates.lastName;
    }
    if (updates.phoneNumber) {
      userUpdates.phoneNumber = updates.phoneNumber;
    }

    // Update user document
    await usersRef.doc(userId).update(userUpdates);
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


export async function getUserDetailsByClientId2(
  clientId: string,
): Promise<Array<UserDetails> | null> {
  try {
    // Step 1: Find the role associated with the clientId
    const roleSnapshot = await rolesRef
      .where('clientId', '==', clientId) // Query using clientId directly
      .limit(1)
      .get();

    if (roleSnapshot.empty) {
      return null; // No role found for the provided clientId
    }

    // Get the role data from the first matching document
    const roleDoc = roleSnapshot.docs[0];
    const roleData = roleDoc.data() as Role; // Get the role data

    // Step 2: Use the roleId to find the user details
    const userDoc = await usersRef
      .where('roleId', 'array-contains', roleData.roleId) // Fetch user by roleId
      .limit(1)
      .get();

    const user = userDoc.empty ? null : userDoc.docs[0].data() as User; // Get the user data

    if (!user) {
      console.log('Error', 'No user found with the provided clientId');
      throw new Error('No user found with the provided clientId');
    }

    // Fetch related details concurrently using Promise.all
    const [validationDoc, addressDoc, roleDocs] = await Promise.all([
      user.validationId
        ? validationsRef.doc(user.validationId).get()
        : Promise.resolve(null),
      user.addressId
        ? addressesRef.doc(user.addressId).get()
        : Promise.resolve(null),
      user.roleId && user.roleId.length > 0
        ? Promise.all(user.roleId.map(roleId => rolesRef.doc(roleId).get()))
        : Promise.resolve([]),
    ]);

    const validation = validationDoc?.exists
      ? (validationDoc.data() as Validation)
      : null;
    const address = addressDoc?.exists ? (addressDoc.data() as Address) : null;
    const roles =
      roleDocs.length > 0
        ? roleDocs.map(roleDoc => roleDoc.data() as Role)
        : [];

    return [
      {
        validation,
        address,
        role: roles.length > 0 ? roles[0] : null, // Assuming you're interested in the first role only
        user,
      },
    ];
  } catch (error) {
    console.error('Error fetching user by clientId:', error);
    return null;
  }
}


// Function to get user details by clientId
export async function getUserDetailsByClientId(
  clientId: string,
): Promise<User | null> {
  try {
    // Step 1: Find the role associated with the clientId
    const roleSnapshot = await rolesRef
      .where('clientId', '==', clientId) // Query using clientId directly
      .limit(1)
      .get();

    if (roleSnapshot.empty) {
      return null; // No role found for the provided clientId
    }

    // Get the role data from the first matching document
    const roleDoc = roleSnapshot.docs[0];
    const roleData = roleDoc.data() as Role; // Get the role data

    // Step 2: Use the roleId to find the user details
    const userSnapshot = await usersRef
      .where('roleId', 'array-contains', roleData.roleId) // Fetch user by roleId
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return null; // No user found with the roleId
    }

    // Get the user document and return the user details
    const userDoc = userSnapshot.docs[0];
    return userDoc.data() as User; // Return user details
  } catch (error) {
    console.error('Error fetching user by clientId:', error);
    return null;
  }
}

export async function getUserDetailsByWorkerId(
  workerId: string,
): Promise<Array<UserDetails> | null> {
  try {
    // Step 1: Find the role associated with the workerId
    const roleSnapshot = await rolesRef
      .where('workerId', '==', workerId) // Query using workerId directly
      .limit(1)
      .get();

    if (roleSnapshot.empty) {
      return null; // No role found for the provided workerId
    }

    // Get the role data from the first matching document
    const roleDoc = roleSnapshot.docs[0];
    const roleData = roleDoc.data() as Role; // Get the role data

    // Step 2: Use the roleId to find the user details
    const userDoc = await usersRef
      .where('roleId', 'array-contains', roleData.roleId) // Fetch user by roleId
      .limit(1)
      .get();

    const user = userDoc.empty ? null : userDoc.docs[0].data() as User; // Get the user data

    if (!user) {
      showAlert('Error', 'No user found with the provided workerId');
      throw new Error('No user found with the provided workerId');
    }
    // Fetch related details concurrently using Promise.all
    const [validationDoc, addressDoc, roleDocs] = await Promise.all([
      user.validationId
        ? validationsRef.doc(user.validationId).get()
        : Promise.resolve(null),
      user.addressId
        ? addressesRef.doc(user.addressId).get()
        : Promise.resolve(null),
      user.roleId && user.roleId.length > 0
        ? Promise.all(user.roleId.map(roleId => rolesRef.doc(roleId).get()))
        : Promise.resolve([]),
    ]);

    const validation = validationDoc?.exists
      ? (validationDoc.data() as Validation)
      : null;
    const address = addressDoc?.exists ? (addressDoc.data() as Address) : null;
    const roles =
      roleDocs.length > 0
        ? roleDocs.map(roleDoc => roleDoc.data() as Role)
        : [];

    return [
      {
        validation,
        address,
        role: roles.length > 0 ? roles[0] : null, // Assuming you're interested in the first role only
        user,
      },
    ];
  } catch (error) {
    console.error('Error fetching user by workerId:', error);
    return null;
  }
}

// export async function getUserDetailsByWorkerId(
//   workerId: string,
// ): Promise<User | null> {
//   try {
//     // Step 1: Find the role associated with the workerId
//     const roleSnapshot = await rolesRef
//       .where('workerId', '==', workerId) // Query using workerId directly
//       .limit(1)
//       .get();

//     if (roleSnapshot.empty) {
//       return null; // No role found for the provided workerId
//     }

//     // Get the role data from the first matching document
//     const roleDoc = roleSnapshot.docs[0];
//     const roleData = roleDoc.data() as Role; // Get the role data

//     // Step 2: Use the roleId to find the user details
//     const userSnapshot = await usersRef
//       .where('roleId', 'array-contains', roleData.roleId) // Fetch user by roleId
//       .limit(1)
//       .get();

//     if (userSnapshot.empty) {
//       return null; // No user found with the roleId
//     }

//     // Get the user document and return the user details
//     const userDoc = userSnapshot.docs[0];
//     return userDoc.data() as User; // Return user details
//   } catch (error) {
//     console.error('Error fetching user by workerId:', error);
//     return null;
//   }
// }

// Function to update the user's defaultRole
export const updateUserRole = async (
  userId: string,
  updates: Partial<User>,
): Promise<void> => {
  try {
    // Fetch the current user data first
    const userDoc = await usersRef.doc(userId).get();
    const userData = userDoc.data() as User;

    // Check if userData and roleId are available
    if (userData && Array.isArray(userData.roleId)) {
      if (userData.roleId.length >= 2) {
        // Determine the new defaultRole
        updates.defaultRole =
          userData.defaultRole === userData.roleId[0]
            ? userData.roleId[1] // Set to worker ID
            : userData.roleId[0]; // Set to client ID
        await usersRef.doc(userId).update(updates);
      } else {
        // Handle the case where roleId has insufficient roles
        console.error('Insufficient roles in roleId array:', userData.roleId);
        showAlert('Error', 'User role information is insufficient.'); // Alert user
      }
    } else {
      console.error('User data or roleId is not valid:', userData);
      showAlert('Error', 'User role information is insufficient.'); // Alert user
    }
  } catch (error) {
    showAlert('Error', 'Failed to update user.');
    console.error('Update user error:', error);
  }
};

// Function to store the FCM token
export const storeFcmToken = async (
  userId: string | null,
  token: string | null,
) => {
  try {
    if (!token || !userId) {
      throw new Error('no token');
    }
    await usersRef.doc(userId).set(
      {
        fcmToken: token,
      },
      { merge: true }, // This will update the existing document or create a new one
    );
    console.log('FCM token stored successfully');
  } catch (error) {
    console.error('Error storing FCM token:', error);
  }
};

// Function to remove the FCM token
export const removeFcmToken = async (userId: string) => {
  try {
    await firestore().collection('users').doc(userId).update({
      fcmToken: firestore.FieldValue.delete(),
    });
    console.log('FCM token removed successfully');
  } catch (error) {
    console.error('Error removing FCM token:', error);
  }
};

// Function to handle token refresh
export const handleTokenRefresh = async (userId: string | null, token: string | null) => {
  if (!userId) {
    return;
  }

  await storeFcmToken(userId, token); // Update the token in Firestore
};

export const getCurrentUserUID = () => {
  return new Promise<string | null>(resolve => {
    const uid = FIREBASE_AUTH.currentUser?.uid; // Get UID

    if (uid) {
      console.log('Current User ID:', uid);

      resolve(uid); // Resolve with UID if available
    } else {
      const unsubscribeAuth = onAuthStateChanged(FIREBASE_AUTH, (user: any) => {
        if (user) {
          resolve(user.uid); // Resolve with UID when user logs in
        } else {
          resolve(null); // Resolve with null if user is logged out
        }
        unsubscribeAuth(); // Cleanup listener
      });
    }
  });
};

export async function getIdByRoleId(
  roleId: string,
): Promise<{ clientId?: string; workerId?: string } | null> {
  try {
    // Fetch the user document that matches the given roleId
    const userSnapshot = await rolesRef.where('roleId', '==', roleId).get();

    if (userSnapshot.empty) {
      console.log('No user found for the given roleId');
      return null; // No user found, return null
    }

    const userData = userSnapshot.docs[0].data() as Role;

    // Return clientId or workerId based on what exists
    return {
      clientId: userData.clientId || undefined,
      workerId: userData.workerId || undefined,
    };
  } catch (error) {
    console.error('Error fetching ID by roleId:', error);
    throw error; // Throw error for further handling
  }
}

export async function getIdByRoleId2(
  id: string,
): Promise<string | null> {
  try {
    // Create a query that checks if 'roleId' array contains the passed 'id'
    const userQuery = usersRef.where('roleId', 'array-contains', id);

    // Fetch the first matching user document
    const userSnapshot = await userQuery.get();

    if (userSnapshot.empty) {
      console.log('No user found for the given id');
      return null; // No user found, return null
    }

    const userData = userSnapshot.docs[0].data() as User;

    // Return userId
    return userData.userId;
  } catch (error) {
    console.error('Error fetching ID by id:', error);
    throw error; // Throw error for further handling
  }
}

export const getUserDefaultRole = async (): Promise<string | null> => {
  try {
    // Get the current user's UID
    const uid = await getCurrentUserUID();

    // Ensure the UID is available
    if (!uid) {
      throw new Error('User not authenticated.');
    }

    // Query Firestore for the user's role data
    const userDoc = await usersRef.doc(uid).get();

    // Check if the document exists
    if (!userDoc.exists) {
      throw new Error('User document does not exist.');
    }

    // Get the role data from the document
    const userData = userDoc.data();

    // Ensure that the role data exists in the document
    if (!userData || !userData.roleId) {
      throw new Error('Role data not found for user.');
    }
    if (userData.roleId[0] === userData.defaultRole) {
      return 'client';
    } else if (userData.roleId[1] === userData.defaultRole) {
      return 'worker';
    } else {
      return null;
    }
  } catch (error) {
    console.error('Failed to fetch user role:', error);
    return null; // Return null or handle the error appropriately
  }
};

export const getUserDefaultRoleUId = async (): Promise<string | null> => {
  try {
    // Get the current user's UID
    const uid = await getCurrentUserUID();

    // Ensure the UID is available
    if (!uid) {
      throw new Error('User not authenticated.');
    }

    // Query Firestore for the user's role data
    const userDoc = await usersRef.doc(uid).get();

    // Check if the document exists
    if (!userDoc.exists) {
      throw new Error('User document does not exist.');
    }

    // Get the role data from the document
    const userData = userDoc.data();

    // Ensure that the role data exists in the document
    if (!userData || !userData.roleId) {
      throw new Error('Role data not found for user.');
    }
    if (userData.roleId[0] === userData.defaultRole) {
      return userData.defaultRole;
    } else if (userData.roleId[1] === userData.defaultRole) {
      return userData.defaultRole;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Failed to fetch user role:', error);
    return null; // Return null or handle the error appropriately
  }
};

export const getUserDefaultUserUid = async (): Promise<string | null> => {
  try {
    // Get the current user's UID
    const uid = await getUserDefaultRoleUId();
    console.log(uid);

    // Ensure the UID is available
    if (!uid) {
      throw new Error('User not authenticated.');
    }

    // Query Firestore for the user's role data
    const userDoc = await rolesRef.doc(uid).get();
    console.log(userDoc);

    // Check if the document exists
    if (!userDoc.exists) {
      throw new Error('User document does not exist.');
    }

    // Get the role data from the document
    const userData = userDoc.data();

    // Ensure that the role data exists in the document
    if (!userData || !userData.roleId) {
      throw new Error('Role data or default role not found for user.');
    }
    console.log(userDoc);

    // Assuming the user has only one roleId, determine if it’s client or worker
    if (userData.clientId) {
      return userData.clientId;
    } else if (userData.workerId) {
      return userData.workerId;
    } else {
      return null; // Return null if no valid role or ids are found
    }
  } catch (error) {
    console.error('Failed to fetch user role:', error);
    return null; // Return null or handle the error appropriately
  }
};
