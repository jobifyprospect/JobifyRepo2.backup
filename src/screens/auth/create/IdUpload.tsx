/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  ScrollView,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import {RootStackParamList} from '../../interfaces/CreateInterfaceParams';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {launchCamera} from 'react-native-image-picker';
import Colors from '../../../styles/Colors';
import {styles} from '../../../styles/globals';
import Background from '../../../components/Background';
import DynamicButton from '../../../components/DynamicButton';

type IDUploadProps = NativeStackScreenProps<RootStackParamList, 'IDUpload'>;

const IDUpload = ({navigation, route}: IDUploadProps) => {
  const {userType, firstName, lastName, phoneNumber, address, email, password} =
    route.params;

  const [idImageFront, setIdImageFront] = useState<string | null>(null);
  const [idImageBack, setIdImageBack] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  const captureImage = (type: 'front' | 'back' | 'selfie') => {
    launchCamera(
      {
        mediaType: 'photo',
      },
      response => {
        if (response.didCancel) {
          Alert.alert('Image capture cancelled');
        } else if (response.errorMessage) {
          Alert.alert('Image capture error', response.errorMessage);
        } else {
          const uri = response.assets?.[0]?.uri;
          if (type === 'front') {
            setIdImageFront(uri || '');
          } else if (type === 'back') {
            setIdImageBack(uri || '');
          } else {
            setSelfieImage(uri || '');
          }
        }
      },
    );
  };

  return (
    <ScrollView style={idUploadStyles.container}>
      <View style={styles.container}>
        <Background />
        <View style={styles.elevate}>
          <View style={idUploadStyles.gap} />
          <View style={idUploadStyles.gap} />
          <View style={idUploadStyles.gap} />

          <View style={styles.headerContainer}>
            <Text style={styles.largeHeading}>Verification Process</Text>
          </View>
          <Text style={styles.regularText}>Upload your ID and selfie</Text>
          <View style={idUploadStyles.imageContainer}>
            <Text style={styles.smallSemiBoldText}>ID Front</Text>
            {idImageFront ? (
              <TouchableOpacity onPress={() => captureImage('front')}>
                <Image
                  source={{uri: idImageFront}}
                  style={idUploadStyles.image}
                />
              </TouchableOpacity>
            ) : (
              <DynamicButton
                title="Capture ID Front"
                onPress={() => captureImage('front')}
                type="primary"
              />
            )}
          </View>
          <View style={idUploadStyles.imageContainer}>
            <Text style={styles.smallSemiBoldText}>ID Back</Text>
            {idImageBack ? (
              <TouchableOpacity onPress={() => captureImage('back')}>
                <Image
                  source={{uri: idImageBack}}
                  style={idUploadStyles.image}
                />
              </TouchableOpacity>
            ) : (
              <DynamicButton
                title="Capture ID Back"
                onPress={() => captureImage('back')}
                type="primary"
              />
            )}
          </View>
          <View style={idUploadStyles.imageContainer}>
            <Text style={styles.smallSemiBoldText}>Selfie</Text>
            {selfieImage ? (
              <TouchableOpacity onPress={() => captureImage('selfie')}>
                <Image
                  source={{uri: selfieImage}}
                  style={idUploadStyles.image}
                />
              </TouchableOpacity>
            ) : (
              <DynamicButton
                title="Capture Selfie"
                onPress={() => captureImage('selfie')}
                type="primary"
              />
            )}
          </View>
          <View style={styles.bottomContainer}>
            <DynamicButton
              title="Create Account"
              onPress={() => {
                Keyboard.dismiss();
              }}
              type="primary"
              disabled={true}
            />
            <DynamicButton
              title="Back"
              onPress={() => {
                Keyboard.dismiss();
                navigation.goBack();
              }}
              type="secondary"
            />
          </View>
          <View style={idUploadStyles.gap} />
          <View style={idUploadStyles.gap} />
          <View style={idUploadStyles.gap} />
        </View>
      </View>
    </ScrollView>
  );
};
const idUploadStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  contentText: {
    fontSize: 18,
    paddingBottom: 20,
  },
  imageContainer: {
    paddingTop: 20,
  },
  imageLabel: {
    fontSize: 16,
    paddingBottom: 8,
  },
  gap: {
    paddingBottom: 24,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingBottom: 8,
    marginTop: 6,
  },
});
export default IDUpload;
