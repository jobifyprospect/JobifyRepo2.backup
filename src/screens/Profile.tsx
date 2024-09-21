import {View, Text, Button} from 'react-native';
import React from 'react';
import {styles} from '../styles/Globals';
import {FIREBASE_AUTH} from '../config/firebase';

const Profile = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.contentText}>Profile</Text>
      <Button onPress={() => FIREBASE_AUTH.signOut()} title="Logout" />
    </View>
  );
};

export default Profile;
