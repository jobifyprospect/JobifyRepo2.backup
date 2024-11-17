import React, {useEffect, useState} from 'react';
import {View, Image, Text, StyleSheet} from 'react-native';
import {
  getWorkerProfilePicture,
  getClientProfilePicture,
} from '../services/firestore/roles';
import Colors from '../styles/Colors';

interface ProfilePictureProps {
  uuId: string; // User ID
  type: 'client' | 'worker'; // Role type
  size?: number; // Optional size prop
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  uuId,
  type,
  size = 40,
}) => {
  const [profileData, setProfileData] = useState<string | undefined>('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const fetchProfilePicture =
          type === 'client' ? getClientProfilePicture : getWorkerProfilePicture;

        const data = await fetchProfilePicture(uuId);
        setProfileData(data);
      } catch (error) {
        console.error(`Failed to fetch profile picture for ${type}:`, error);
      }
    };

    fetchProfileData();
  }, [uuId, type]);

  const isProfilePicture = profileData && !profileData.includes('undefined');

  return (
    <View style={[styles.profileContainer, {width: size, height: size}]}>
      {isProfilePicture ? (
        <Image
          source={{uri: profileData}}
          style={[
            styles.profileImage,
            {width: size, height: size, borderRadius: size / 2},
          ]}
        />
      ) : (
        <View
          style={[
            styles.initialsContainer,
            {width: size, height: size, borderRadius: size / 2},
          ]}>
          <Text style={[styles.initialsText, {fontSize: size / 2.5}]}>
            {profileData}
          </Text>
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
    borderRadius: 20, // Dynamically adjusted with size prop
  },
  initialsContainer: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});

export default ProfilePicture;
