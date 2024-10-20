import {FIRESTORE_STORAGE} from '../../config/firebase';

export const deleteUploadedImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract the file path from the URL
    const filePath = imageUrl.split('/o/')[1].split('?')[0].replace('%2F', '/');

    // Delete the file from Firebase Storage
    await FIRESTORE_STORAGE.ref(filePath).delete();
    console.log(`Image deleted from Firebase Storage: ${filePath}`);
  } catch (error) {
    console.error('Error deleting image from Firebase Storage:', error);
  }
};
