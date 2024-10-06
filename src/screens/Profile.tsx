import {View, Text, Button} from 'react-native';
import React, {useCallback} from 'react';
import {styles} from '../styles/Globals';
import {FIREBASE_AUTH, getCurrentUserUID} from '../config/firebase';
import {updateUserRole} from '../services/firestore/users';
import {showAlert} from '../components/AlertDialog';

const Profile = () => {
  const handleUpdateUser = useCallback(async () => {
    try {
      const uid: string | null = await getCurrentUserUID();
      console.log('Current User UID:', uid);

      if (uid) {
        console.log('Current User Data:', uid);

        // Update the user's role
        await updateUserRole(uid, {}); // Update with necessary data if needed
        console.log('User role updated successfully.');
      } else {
        console.error('No user ID found.');
      }
      showAlert('Success', 'User role changed successfully');
    } catch (error) {
      console.error('Failed to Update:', error);
    } finally {
      // Optionally sign out if needed
      FIREBASE_AUTH.signOut();
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.contentText}>Profile</Text>
      <Button onPress={handleUpdateUser} title="CHANGE USER" />
      {/* Fixed button press handler */}
      <Button onPress={() => FIREBASE_AUTH.signOut()} title="Logout" />
    </View>
  );
};

export default Profile;
