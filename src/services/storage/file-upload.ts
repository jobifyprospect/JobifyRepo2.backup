import {FIRESTORE_STORAGE} from '../../config/firebase';

export const uploadFile = async (
  fileUri: string,
  storagePath: string,
): Promise<string> => {
  try {
    const ref = FIRESTORE_STORAGE.ref(storagePath);

    // Upload file using file URI
    await ref.putFile(fileUri);

    // Get download URL
    const downloadUrl = await ref.getDownloadURL();
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
