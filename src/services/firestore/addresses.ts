import { showAlert } from '../../components/AlertDialog';
import { FIRESTORE_DB } from '../../config/firebase';
import { Address } from '../interfaces/address';

const addressesRef = FIRESTORE_DB.collection('addresses');

// Create an address
export const createAddress = async (address: Address): Promise<void> => {
  try {
    await addressesRef.doc(address.addressId).set(address);
  } catch (error) {
    showAlert('Error', 'Failed to create address.');
    console.error(error);
  }
};

// Read an address
export const getAddress = async (
  addressId: string,
): Promise<Address | null> => {
  try {
    const doc = await addressesRef.doc(addressId).get();
    return doc.exists ? (doc.data() as Address) : null;
  } catch (error) {
    showAlert('Error', 'Failed to fetch address.');
    console.error(error);
    return null;
  }
};

// Update an address
export const updateAddress = async (
  addressId: string,
  updates: Partial<Address>,
): Promise<void> => {
  try {
    await addressesRef.doc(addressId).update(updates);
  } catch (error) {
    showAlert('Error', 'Failed to update address.');
    console.error(error);
  }
};

// Delete an address
export const deleteAddress = async (addressId: string): Promise<void> => {
  try {
    await addressesRef.doc(addressId).delete();
  } catch (error) {
    showAlert('Error', 'Failed to delete address.');
    console.error(error);
  }
};
