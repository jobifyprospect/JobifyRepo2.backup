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
import {launchCamera} from 'react-native-image-picker';
import Colors from '../../../styles/Colors';
import {styles} from '../../../styles/Globals';
import Background from '../../../components/Background';
import DynamicButton from '../../../components/DynamicButton';
import {firebase} from '@react-native-firebase/firestore';
import {createAddress} from '../../../services/firestore/addresses';
import {createClient} from '../../../services/firestore/clients';
import {createRole} from '../../../services/firestore/roles';
import {createUser} from '../../../services/firestore/users';
import {createWorker} from '../../../services/firestore/workers';
import {uploadImage} from '../../../services/storage/id-upload';
import {Address} from '../../../services/interfaces/address';
import {Client} from '../../../services/interfaces/client';
import {Worker} from '../../../services/interfaces/worker';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../interfaces/RouterStackInterfaceParams';
import {User} from '../../../services/interfaces/user';
import {Role} from '../../../services/interfaces/role';
import {showAlert} from '../../../components/AlertDialog';
import uuid from 'react-native-uuid';
import {deleteUploadedImage} from '../../../services/storage/id-delete';
import {convertImageToBase64} from '../../../utils/Utils';
import {FIREBASE_AUTH} from '../../../config/firebase';

type IDUploadProps = NativeStackScreenProps<RootStackParamList, 'IDUpload'>;

const IDUpload = ({navigation, route}: IDUploadProps) => {
  const {userType, firstName, lastName, phoneNumber, address, email, password} =
    route.params;

  const [idImageFront, setIdImageFront] = useState<string>('');
  const [idImageBack, setIdImageBack] = useState<string>('');
  const [selfieImage, setSelfieImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCreateAccount = async () => {
    setIsSubmitting(true);

    let userId: string | null = null;
    let frontImageUrl: string | null = null;
    let backImageUrl: string | null = null;
    let selfieImageUrl: string | null = null;

    try {
      const authUser = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);
      userId = authUser.user.uid;
      const roleId = uuid.v4().toString();
      const addressId = uuid.v4().toString();
      const validationId = uuid.v4().toString();

      const frontImageBase64 = await convertImageToBase64(idImageFront);
      const backImageBase64 = await convertImageToBase64(idImageBack);
      const selfieImageBase64 = await convertImageToBase64(selfieImage);

      if (!frontImageBase64 || !backImageBase64 || !selfieImageBase64) {
        throw new Error('Failed to convert images to Base64.');
      }

      frontImageUrl = await uploadImage(
        frontImageBase64,
        `id-images/${userId}_front.jpg`,
        true,
      );
      backImageUrl = await uploadImage(
        backImageBase64,
        `id-images/${userId}_back.jpg`,
        true,
      );
      selfieImageUrl = await uploadImage(
        selfieImageBase64,
        `selfie-images/${userId}_selfie.jpg`,
        true,
      );

      const newAddress: Address = {
        addressId,
        ...address,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      await createAddress(newAddress);

      const newUser: User = {
        userId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        roleId,
      };
      await createUser(newUser);

      const newRole: Role = {
        roleId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      if (userType === 'client') {
        const newClient: Client = {
          clientId: uuid.v4().toString(),
          firstName,
          lastName,
          profilePicture: selfieImageUrl,
          validationId,
          addressId,
          phoneNumber,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        await createClient(newClient);
        newRole.clientId = newClient.clientId;
      } else if (userType === 'worker') {
        const newWorker: Worker = {
          workerId: uuid.v4().toString(),
          firstName,
          lastName,
          profilePicture: selfieImageUrl,
          validationId,
          addressId,
          phoneNumber,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        await createWorker(newWorker);
        newRole.workerId = newWorker.workerId;
      }

      await createRole(newRole);

      showAlert('Success', 'Account created successfully!');
    } catch (error) {
      console.error('Error during account creation:', error);

      // Rollback logic
      if (userId) {
        await FIREBASE_AUTH.currentUser?.delete();
      }
      if (frontImageUrl) {
        await deleteUploadedImage(frontImageUrl);
      }
      if (backImageUrl) {
        await deleteUploadedImage(backImageUrl);
      }
      if (selfieImageUrl) {
        await deleteUploadedImage(selfieImageUrl);
      }

      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

          {/* ID Front Upload */}
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

          {/* ID Back Upload */}
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

          {/* Selfie Upload */}
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

          {/* Buttons */}
          <View style={styles.bottomContainer}>
            <DynamicButton
              title="Create Account"
              onPress={handleCreateAccount}
              type="primary"
              disabled={
                isSubmitting || !idImageFront || !idImageBack || !selfieImage
              }
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
