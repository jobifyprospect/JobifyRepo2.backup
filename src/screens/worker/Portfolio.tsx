import { ActivityIndicator, Alert, Button, Dimensions, Image, PermissionsAndroid, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/Globals";
import { NavigationProp, Route, useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { getUserDetails, updateUser } from "../../services/firestore/users";
import { getWorker } from "../../services/firestore/workers";
import { showAlert } from "../../components/AlertDialog";
import { Worker } from "../../services/interfaces/worker";
import { User } from "../../services/interfaces/user";
import { Address } from "../../services/interfaces/address";
import { Validation } from "../../services/interfaces/validation";
import Colors from "../../styles/Colors";
import BackButton from "../../components/BackButton";
import { DocumentPickerOptions } from "react-native-document-picker";
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Pdf from 'react-native-pdf';
import { Linking } from "react-native";
import DynamicButton from "../../components/DynamicButton";
import React from "react";
import { uploadFile } from "../../services/storage/file-upload";
import DocumentPicker from 'react-native-document-picker';
import { convertImageToBase64 } from "../../utils/Utils";
import { uploadImage } from "../../services/storage/id-upload";
import uuid from 'react-native-uuid';
import { FIRESTORE_TIMESTAMP } from "../../config/firebase";
import firestore from '@react-native-firebase/firestore';

interface RouterProps {
    navigation: NavigationProp<any, any>;
    route: Route<string, { workerId: string, userId: string }>;
}
export default function Portfolio({ navigation, route }: RouterProps) {

    const workerId = route.params.workerId ?? '';
    const userId = route.params.userId ?? '';

    const [pdfPortfolio, setPdfPortfolio] = useState<string>('');
    const [pdfFileName, setPdfFileName] = useState<string>('');
    const [certificationImages, setCertificationImages] = useState<string[]>([]);

    const [isUploadingPDF, setIsUploadingPDF] = useState<boolean>(false);
    const [isUploadingCertifications, setIsUploadingCertifications] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>();
    const [userDetails, setUserDetails] = useState<User>();
    const [worker, setWorker] = useState<Worker>();
    const [address, setAddress] = useState<Address>();
    const [validation, setValidation] = useState<Validation>();

    const [pdfSource, setPdfSource] = useState<{ uri: string } | null>({ uri: '' });

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
        if (userDetails?.pdfPortfolio) {
            setPdfSource({ uri: userDetails.pdfPortfolio });
        }
    }, [userDetails?.pdfPortfolio]);

    async function getUser(worker_id: string, user_id: string) {
        setIsLoading(true);

        try {
            const [workerUserDetails, workerDetails] = await Promise.all([
                getUserDetails(user_id),
                getWorker(worker_id)
            ]);

            if (!workerUserDetails || !workerDetails) {
                console.log('Failed to fetch worker profile.');
                return null;
            }

            const [userDetails] = workerUserDetails;
            const { user, address, validation } = userDetails;
            setUserDetails(user as User);
            setAddress(address as Address);
            setValidation(validation as Validation);
            setWorker(workerDetails);
        } catch (error) {
            console.error('Error fetching worker data:', error);
            showAlert('Error', 'Failed to fetch worker profile. Please try again later.');
            return null;
        } finally {
            setIsLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            let worker = null;

            if (!workerId || !userId) {
                console.log('Missing necessary parameters for this page.')
                return;
            }

            try {
                worker = getUser(workerId, userId);
            } catch (e) {
                showAlert('Error', 'Failed to fetch worker details. Please try again later.')
            }
            return () => {
                worker = null;
            };
        }, [userId, workerId])
    );

    useEffect(() => {
        console.log('certs: ', userDetails?.certificationImages)
    }, [userDetails]);

    useEffect(() => {
        requestStoragePermission();
    }, []);


    let pdfPortfolioUrl: string | null = null;
    let certificationImageUrls: string[] = [];

    async function uploadPDF() {
        setIsUploadingPDF(true)
        try {
            if (pdfPortfolio) {
                pdfPortfolioUrl = await uploadFile(
                    pdfPortfolio,
                    `pdf-portfolio/${userId}.pdf`,
                );
            }

            const newUser: Partial<User> = {
                pdfPortfolio: pdfPortfolioUrl,
            }

            const res = await updateUser(userId, newUser);

            if (res !== null) {
                showAlert('Success', 'PDF uploaded successfully.');
                setPdfPortfolio('');
            }
        } catch (error) {
            showAlert('Error', 'Failed to upload PDF.');
        } finally {
            setIsUploadingPDF(false)
        }
    }

    async function uploadCerts() {
        setIsUploadingCertifications(true)
        try {
            for (const image of certificationImages) {
                const imageBase64 = await convertImageToBase64(image);
                if (imageBase64) {
                    const imageUrl = await uploadImage(
                        imageBase64,
                        `certification-images/${userId}_${uuid.v4()}.jpg`,
                        true,
                    );
                    certificationImageUrls.push(imageUrl);
                }
            }

            const newUser: Partial<User> = {
                certificationImages: firestore.FieldValue.arrayUnion(certificationImageUrls) as any,
                updatedAt: FIRESTORE_TIMESTAMP,
            }

            const res = await updateUser(userId, newUser);

            if (res !== null) {
                showAlert('Success', 'Certifications uploaded successfully.');
                setCertificationImages([]);
            }
        } catch (error) {
            showAlert('Error', 'Failed to upload images.');
        } finally {
            setIsUploadingCertifications(false)
        }
    }

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

    const removePdf = () => {
        setPdfPortfolio('');
    };

    const removeCertificationImage = (index: number) => {
        const updatedImages = certificationImages.filter((_, i) => i !== index);
        setCertificationImages(updatedImages);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={localStyles.container}>
                <BackButton onPress={async () => navigation.goBack()} />

                <View style={[localStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.mediumText}> Loading your portfolio </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={localStyles.container}>
            <View style={localStyles.headerContainer}>
                <BackButton onPress={async () => navigation.goBack()} />

                <DynamicButton
                    title="Edit"
                    onPress={() => showAlert('Coming Soon', 'If urgent, please contact the Jobify team for assistance at "troyonting111.gmail.com"')}
                    type="secondary" />
            </View>

            <Text style={styles.largeHeading}> Portfolio and Certifications </Text>

            <Divider />

            <ScrollView>
                <RowItem>
                    <Text style={styles.boldText}> Portfolio </Text>
                    <View style={localStyles.gap} />

                    {userDetails?.pdfPortfolio ?
                        <>
                            {pdfSource && (
                                <Pdf
                                    trustAllCerts={false}
                                    source={pdfSource}
                                    onLoadComplete={(numberOfPages, filePath) => {
                                        console.log(`Number of pages: ${numberOfPages}`);
                                    }}
                                    onPageChanged={(page, numberOfPages) => {
                                        console.log(`Current page: ${page}`);
                                    }}
                                    onError={(error) => {
                                        console.log(error);
                                        showAlert('Error', 'Failed to load PDF. Please try again later.');
                                    }}
                                    onPressLink={(uri) => {
                                        console.log(`Link pressed: ${uri}`);
                                    }}
                                    style={localStyles.portfolioImage}
                                />
                            )}
                        </>
                        :
                        <>

                            {/* PDF Upload */}
                            <View style={filesUploadStyles.fileContainer}>
                                <Text style={styles.boldText}> Looks like you haven't uploaded your portfolio yet, upload by clicking the button. </Text>
                                <View style={localStyles.gap} />
                                {pdfPortfolio ? (
                                    <View>
                                        <TouchableOpacity onPress={pickPdf}>
                                            <Text> Selected file: </Text>
                                            <Text style={filesUploadStyles.fileName}>{pdfFileName}</Text>
                                        </TouchableOpacity>
                                        <DynamicButton
                                            title="Remove PDF"
                                            onPress={removePdf}
                                            type="destructive"
                                        />

                                        <DynamicButton
                                            title="Upload PDF"
                                            onPress={uploadPDF}
                                            type="primary"
                                            disabled={isUploadingPDF}
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
                        </>
                    }
                </RowItem>

                <Divider />

                <RowItem>
                    <Text style={styles.boldText}> Certifications </Text>
                    <View style={localStyles.gap} />

                    {userDetails?.certificationImages ?
                        <View>
                            {userDetails?.certificationImages.map((image, index) => (
                                <Image
                                    key={image}
                                    source={{ uri: image }}
                                    style={localStyles.certImage}
                                />
                            ))}
                        </View>
                        :
                        <View style={filesUploadStyles.fileContainer}>
                            <Text style={styles.smallSemiBoldText}>Certification Images</Text>
                            {certificationImages.map((uri, index) => (
                                <View key={index}>
                                    <Text style={styles.smallSemiBoldText}>
                                        Certificate {index + 1}
                                    </Text>
                                    <Image source={{ uri }} style={filesUploadStyles.image} />
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
                                type="secondary"
                            />
                            <DynamicButton
                                title="Pick Image"
                                onPress={pickImage}
                                type="secondary"
                            />
                            {certificationImages.length > 0 &&
                                <DynamicButton
                                    title="Upload images"
                                    onPress={uploadCerts}
                                    type="primary"
                                    disabled={isUploadingCertifications}
                                />
                            }
                        </View>
                    }
                </RowItem>

            </ScrollView>
        </SafeAreaView >
    )

}

function Divider() {
    return (
        <View style={localStyles.divider} />
    )
}
function RowItem({ children }: { children: React.ReactNode }) {
    return (
        <View style={localStyles.row}>
            {children}
        </View>
    )
}

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

const localStyles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 36,
    },
    portfolioImage: {
        width: Dimensions.get('window').width - 50, // Full width minus padding
        height: (Dimensions.get('window').width - 60) * 2, // Aspect ratio 4:3
        marginBottom: 16, // Add some space between images
    },
    certImage: {
        width: Dimensions.get('window').width - 60, // Full width minus padding
        height: (Dimensions.get('window').width - 60) * 0.75, // Aspect ratio 4:3
        borderColor: Colors.primary,
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 16, // Add some space between images
        resizeMode: 'cover', // Ensure the image covers the entire space
    },
    gap: {
        height: 8,
    },
    container: {
        paddingHorizontal: 30,
        paddingTop: 25,
        flex: 1,
    },
    screen: {
        flex: 1,
        paddingTop: 24,
        rowGap: 24,
    },
    biographyContainer: {
        width: '100%',
        padding: 10,
    },
    biographyText: {
        flexWrap: 'wrap',
        fontSize: 16,
        lineHeight: 24,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.placeholder,
        marginVertical: 16,
    },
    row: {
        rowGap: 4,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.placeholder,
        borderRadius: 5,
        padding: 8,
    },
})