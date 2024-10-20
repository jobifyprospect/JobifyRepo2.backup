import {showAlert} from '../../components/AlertDialog';
import {FIRESTORE_DB} from '../../config/firebase';
import {Validation} from '../interfaces/validation';

const validationsRef = FIRESTORE_DB.collection('validations');
// Create a validation
export const createValidation = async (
  validation: Validation,
): Promise<void> => {
  try {
    await validationsRef.doc(validation.validationId).set(validation);
  } catch (error) {
    showAlert('Error', 'Failed to create validation.');
    console.error(error);
  }
};

// Read a validation
export const getValidation = async (
  validationId: string,
): Promise<Validation | null> => {
  try {
    const doc = await validationsRef.doc(validationId).get();
    return doc.exists ? (doc.data() as Validation) : null;
  } catch (error) {
    showAlert('Error', 'Failed to fetch validation.');
    console.error(error);
    return null;
  }
};

// Update a validation
export const updateValidation = async (
  validationId: string,
  updates: Partial<Validation>,
): Promise<void> => {
  try {
    await validationsRef.doc(validationId).update(updates);
  } catch (error) {
    showAlert('Error', 'Failed to update validation.');
    console.error(error);
  }
};

// Delete a validation
export const deleteValidation = async (validationId: string): Promise<void> => {
  try {
    await validationsRef.doc(validationId).delete();
  } catch (error) {
    showAlert('Error', 'Failed to delete validation.');
    console.error(error);
  }
};
