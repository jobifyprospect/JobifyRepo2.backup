import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Colors from '../../../styles/Colors';
import {styles} from '../../../styles/Globals';
import Background from '../../../components/Background';
import DynamicButton from '../../../components/DynamicButton';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../interfaces/RouterStackInterfaceParams';

type FilesUploadProps = NativeStackScreenProps<
  RootStackParamList,
  'FilesUpload'
>;

const FilesUpload = ({navigation, route}: FilesUploadProps) => {
  const {userType, firstName, lastName, phoneNumber, address, email, password} =
    route.params;

  const [pdfPortfolio, setPdfPortfolio] = useState<string>('');
  const [certificationImages, setCertificationImages] = useState<string[]>([]);
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your storage to upload files.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the storage');
        } else {
          console.log('Storage permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  useEffect(() => {
    requestStoragePermission();
  }, []);

  const pickPdf = async () => {
    try {
      let documents = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
        copyTo: 'documentDirectory',
      });
      documents = documents.map(doc => ({
        ...doc,
        fileCopyUri: doc.fileCopyUri
          ? `file://${decodeURIComponent(doc.fileCopyUri)}`
          : '',
      }));
      if (documents[0].fileCopyUri) {
        setPdfPortfolio(documents[0].fileCopyUri);
      } else {
        Alert.alert('PDF selection error', 'File URI is null');
      }
      setPdfFileName(documents[0].name ?? '');
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        Alert.alert('PDF selection cancelled');
      } else {
        if (err instanceof Error) {
          Alert.alert('PDF selection error', err.message);
        } else {
          Alert.alert('PDF selection error', 'An unknown error occurred');
        }
      }
    }
  };

  const captureImage = async () => {
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
          if (uri) {
            setCertificationImages([...certificationImages, uri]);
          }
        }
      },
    );
  };

  const pickImage = async () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
      },
      response => {
        if (response.didCancel) {
          Alert.alert('Image selection cancelled');
        } else if (response.errorMessage) {
          Alert.alert('Image selection error', response.errorMessage);
        } else {
          const uri = response.assets?.[0]?.uri;
          if (uri) {
            setCertificationImages([...certificationImages, uri]);
          }
        }
      },
    );
  };

  const removePdf = () => {
    setPdfPortfolio('');
  };

  const removeCertificationImage = (index: number) => {
    const updatedImages = certificationImages.filter((_, i) => i !== index);
    setCertificationImages(updatedImages);
  };

  const handleNext = () => {
    navigation.navigate('IDUpload', {
      userType,
      firstName,
      lastName,
      phoneNumber,
      address,
      email,
      password,
      pdfPortfolio,
      certificationImages,
    });
  };

  return (
    <ScrollView style={filesUploadStyles.container}>
      <View style={styles.container}>
        <Background />
        <View style={styles.elevate}>
          <View style={filesUploadStyles.gap} />
          <View style={filesUploadStyles.gap} />
          <View style={filesUploadStyles.gap} />
          <View style={styles.headerContainer}>
            <Text style={styles.largeHeading}>Upload Files</Text>
          </View>
          <Text style={styles.regularText}>
            Upload your PDF portfolio and certification images.
          </Text>

          {/* PDF Upload */}
          <View style={filesUploadStyles.fileContainer}>
            <Text style={styles.smallSemiBoldText}>PDF Portfolio</Text>
            {pdfPortfolio ? (
              <View>
                <TouchableOpacity onPress={pickPdf}>
                  <Text style={filesUploadStyles.fileName}>{pdfFileName}</Text>
                </TouchableOpacity>
                <DynamicButton
                  title="Remove PDF"
                  onPress={removePdf}
                  type="secondary"
                />
              </View>
            ) : (
              <DynamicButton
                title="Pick PDF"
                onPress={pickPdf}
                type="primary"
              />
            )}
          </View>

          {/* Certification Images Upload */}
          <View style={filesUploadStyles.fileContainer}>
            <Text style={styles.smallSemiBoldText}>Certification Images</Text>
            {certificationImages.map((uri, index) => (
              <View key={index}>
                <Text style={styles.smallSemiBoldText}>
                  Certificate {index + 1}
                </Text>
                <Image source={{uri}} style={filesUploadStyles.image} />
                <DynamicButton
                  title="Remove Image"
                  onPress={() => removeCertificationImage(index)}
                  type="secondary"
                />
              </View>
            ))}
            <Text style={styles.smallSemiBoldText}>
              Add image by Capturing or by Uploading Certificate
            </Text>
            <DynamicButton
              title="Capture Image"
              onPress={captureImage}
              type="primary"
            />
            <DynamicButton
              title="Pick Image"
              onPress={pickImage}
              type="primary"
            />
          </View>
          <View style={filesUploadStyles.gap} />

          {/* Buttons */}
          <View style={styles.bottomContainer}>
            <DynamicButton title="Next" onPress={handleNext} type="primary" />
            <DynamicButton
              title="Back"
              onPress={() => {
                navigation.goBack();
              }}
              type="secondary"
            />
          </View>
          <View style={filesUploadStyles.gap} />
          <View style={filesUploadStyles.gap} />
          <View style={filesUploadStyles.gap} />
        </View>
      </View>
    </ScrollView>
  );
};

const filesUploadStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fileContainer: {
    paddingTop: 20,
  },
  fileName: {
    fontSize: 16,
    paddingBottom: 8,
    color: Colors.primary,
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

export default FilesUpload;
