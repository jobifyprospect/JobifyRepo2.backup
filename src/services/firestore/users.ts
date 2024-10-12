import {showAlert} from '../../components/AlertDialog';
import {
  addressesRef,
  rolesRef,
  usersRef,
  validationsRef,
} from '../../config/firebase';
import {Address} from '../interfaces/address';
import {Role} from '../interfaces/role';
import {User} from '../interfaces/user';
import {UserDetails} from '../interfaces/userDetails';
import {Validation} from '../interfaces/validation';

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

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await usersRef.doc(userId).delete();
  } catch (error) {
    showAlert('Error', 'Failed to delete user.');
    console.error(error);
  }
};

// Function to get user details by clientId
export async function getUserDetailsByClientId(
  clientId: string,
): Promise<User | null> {
  try {
    // Step 1: Find the role associated with the clientId
    const roleSnapshot = await rolesRef
      .where('roleId', '==', clientId) // Query using clientId directly
      .limit(1)
      .get();

    if (roleSnapshot.empty) {
      console.log('No matching role found for clientId:', clientId);
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
      console.log('No matching user found for roleId:', roleData.roleId);
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
      console.log('User Role ID:', userData.roleId); // Log roleId for debugging

      // Ensure there are at least two roles in roleId
      if (userData.roleId.length >= 2) {
        // Determine the new defaultRole
        updates.defaultRole =
          userData.defaultRole === userData.roleId[0]
            ? userData.roleId[1] // Set to worker ID
            : userData.roleId[0]; // Set to client ID

        // Log the updated defaultRole for debugging
        console.log('Updated Default Role:', updates.defaultRole);

        // Update the user document in Firestore
        await usersRef.doc(userId).update(updates);
        console.log('User role updated successfully.');
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
