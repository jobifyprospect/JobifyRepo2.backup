import React, { useState } from 'react';
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
import { launchCamera } from 'react-native-image-picker';
import Colors from '../../../styles/Colors';
import { styles } from '../../../styles/Globals';
import Background from '../../../components/Background';
import DynamicButton from '../../../components/DynamicButton';
import { firebase } from '@react-native-firebase/firestore';
import { createAddress } from '../../../services/firestore/addresses';
import { createRole } from '../../../services/firestore/roles';
import { createUser } from '../../../services/firestore/users';
import { uploadImage } from '../../../services/storage/id-upload';
import { Address } from '../../../services/interfaces/address';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../interfaces/RouterStackInterfaceParams';
import { User } from '../../../services/interfaces/user';
import { Role } from '../../../services/interfaces/role';
import { showAlert } from '../../../components/AlertDialog';
import uuid from 'react-native-uuid';
import { deleteUploadedImage } from '../../../services/storage/id-delete';
import { convertImageToBase64 } from '../../../utils/Utils';
import { FIREBASE_AUTH, FIRESTORE_TIMESTAMP } from '../../../config/firebase';
import { Notification } from '../../../services/interfaces/notification';
import { createNotification } from '../../../services/firestore/notifications';
import { createClient } from '../../../services/firestore/clients';
import { createWorker } from '../../../services/firestore/workers';
import { Client } from '../../../services/interfaces/client';
import { Worker } from '../../../services/interfaces/worker';
import { setIsNewUser } from '../../../shared/AuthUtils';

type IDUploadProps = NativeStackScreenProps<RootStackParamList, 'IDUpload'>;

const IDUpload = ({ navigation, route }: IDUploadProps) => {
  const { userType, firstName, lastName, phoneNumber, address, email, password } =
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
    await setIsNewUser(true);
    let userId: string | null = null;
    let userEmail: string | null = null;
    let frontImageUrl: string | null = null;
    let backImageUrl: string | null = null;
    let selfieImageUrl: string | null = null;

    try {
      const authUser = await FIREBASE_AUTH.createUserWithEmailAndPassword(
        email,
        password,
      );
      userId = authUser.user.uid;
      userEmail = authUser.user.email;

      const addressId = uuid.v4().toString(); // Unique address ID
      const validationId = uuid.v4().toString(); // Unique validation ID

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
        createdAt: FIRESTORE_TIMESTAMP,
        updatedAt: FIRESTORE_TIMESTAMP,
      };
      await createAddress(newAddress);

      // Create roles
      const clientRoleId = uuid.v4().toString(); // Unique client role ID
      const workerRoleId = uuid.v4().toString(); // Unique worker role ID

      const newUser: User = {
        userId,
        createdAt: FIRESTORE_TIMESTAMP,
        updatedAt: FIRESTORE_TIMESTAMP,
        roleId: [clientRoleId, workerRoleId], // Store both role IDs
        firstName,
        lastName,
        email: userEmail,
        defaultRole: userType === 'client' ? clientRoleId : workerRoleId,
        profilePicture: selfieImageUrl,
        frontId: frontImageUrl,
        backId: backImageUrl,
        validationId,
        addressId,
        phoneNumber,
      };
      await createUser(newUser);

      // Create roles for client and worker
      const clientRole: Role = {
        roleId: clientRoleId,
        createdAt: FIRESTORE_TIMESTAMP,
        updatedAt: FIRESTORE_TIMESTAMP,
        clientId: uuid.v4().toString(), // Create a unique client ID
      };

      const workerRole: Role = {
        roleId: workerRoleId,
        createdAt: FIRESTORE_TIMESTAMP,
        updatedAt: FIRESTORE_TIMESTAMP,
        workerId: uuid.v4().toString(), // Create a unique worker ID
      };

      await createRole(clientRole);
      await createRole(workerRole);

      // Create Client
      const newClient: Client = {
        clientId: clientRole.clientId, // Use the unique client ID created earlier
        userId,
        createdAt: FIRESTORE_TIMESTAMP,
        updatedAt: FIRESTORE_TIMESTAMP,
      };
      await createClient(newClient); // Function to create the client document in Firestore

      // Create Worker
      const newWorker: Worker = {
        workerId: workerRole.workerId, // Use the unique worker ID created earlier
        userId,
        createdAt: FIRESTORE_TIMESTAMP,
        updatedAt: FIRESTORE_TIMESTAMP,
      };
      await createWorker(newWorker); // Function to create the worker document in Firestore

      // Create a notification
      const newNotification: Notification = {
        id: uuid.v4().toString(), // Generate a unique notification ID
        title: 'Account Created',
        subtitle: `Welcome, ${firstName}! Your account has been successfully created.`,
        senderId: userId, // The ID of the user who created the account
        receiverId: userId, // The receiver ID (same user for now)
        createdAt: FIRESTORE_TIMESTAMP,
        updatedAt: FIRESTORE_TIMESTAMP,
        isRead: false, // Default value
      };

      await createNotification(newNotification); // Call the function to create the notification
      showAlert('Success', 'Account created successfully!');
      await firebase.auth().signOut();
    } catch (error) {
      setIsNewUser(false);
      console.error('Error during account creation:', error);
      // Rollback logic
      if (userId) {
        await firebase.auth().currentUser?.delete();
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

      Alert.alert('Error', `Failed to create account, ${error} `);
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
          <Text style={styles.regularText}>
            Upload your valid government ID and selfie. Selfie Image will be used as your profile
            picture
          </Text>

          {/* ID Front Upload */}
          <View style={idUploadStyles.imageContainer}>
            <Text style={styles.smallSemiBoldText}>Government ID Front</Text>
            {idImageFront ? (
              <TouchableOpacity onPress={() => captureImage('front')}>
                <Image
                  source={{ uri: idImageFront }}
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
            <Text style={styles.smallSemiBoldText}>Government ID Back</Text>
            {idImageBack ? (
              <TouchableOpacity onPress={() => captureImage('back')}>
                <Image
                  source={{ uri: idImageBack }}
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
                  source={{ uri: selfieImage }}
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
