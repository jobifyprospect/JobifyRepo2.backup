import React, {useEffect, useState} from 'react';
import {View, Image, Text, StyleSheet} from 'react-native';
import {getWorkerProfilePicture} from '../services/firestore/roles';
import Colors from '../styles/Colors';

interface WorkerItemProps {
  workerId: any;
}
const ProfilePicture: React.FC<WorkerItemProps> = ({workerId: workerId}) => {
  const [profileData, setProfileData] = useState<string | undefined>('');

  useEffect(() => {
    const fetchProfileData = async () => {
      const data = await getWorkerProfilePicture(workerId);
      setProfileData(data);
    };

    fetchProfileData();
  }, [workerId]);

  const isProfilePicture = profileData && !profileData.includes('undefined');

  return (
    <View style={styles.profileContainer}>
      {isProfilePicture ? (
        <Image source={{uri: profileData}} style={styles.profileImage} />
      ) : (
        <View style={styles.initialsContainer}>
          <Text style={styles.initialsText}>{profileData}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    marginRight: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  initialsContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfilePicture;
