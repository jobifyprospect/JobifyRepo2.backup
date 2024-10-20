import {FIRESTORE_STORAGE} from '../../config/firebase';

export const uploadImage = async (
  base64Image: string,
  storagePath: string,
  isBase64: boolean = false,
): Promise<string> => {
  try {
    const ref = FIRESTORE_STORAGE.ref(storagePath);

    if (isBase64) {
      // Upload Base64 encoded image
      await ref.putString(base64Image, 'data_url');
    } else {
      // Upload image using file URI
      await ref.putFile(base64Image);
    }

    // Get download URL
    const downloadUrl = await ref.getDownloadURL();
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
