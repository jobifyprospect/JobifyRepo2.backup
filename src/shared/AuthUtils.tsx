import AsyncStorage from '@react-native-async-storage/async-storage';

// Retrieve the isNewUser flag from AsyncStorage
export const getIsNewUser = async () => {
  try {
    const isNewUser = await AsyncStorage.getItem('isNewUser');
    return isNewUser === 'true'; // Convert the string back to a boolean
  } catch (error) {
    console.error('Error retrieving isNewUser:', error);
    return false;
  }
};

// Set the isNewUser flag in AsyncStorage
export const setIsNewUser = async (isNewUser: boolean) => {
  try {
    await AsyncStorage.setItem('isNewUser', String(isNewUser)); // Store as a string
  } catch (error) {
    console.error('Error setting isNewUser:', error);
  }
};

// Remove the isNewUser flag from AsyncStorage
export const removeIsNewUser = async () => {
  try {
    await AsyncStorage.removeItem('isNewUser');
  } catch (error) {
    console.error('Error removing isNewUser:', error);
  }
};
