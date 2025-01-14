import React from "react";
import { NavigationProp, Route, useFocusEffect } from "@react-navigation/native";
import { View, Text, SafeAreaView, StyleSheet, Image, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import { styles } from "../../styles/Globals";
import BackButton from "../../components/BackButton";
import { showAlert } from "../../components/AlertDialog";
import { useCallback, useEffect, useState } from "react";
import Colors from "../../styles/Colors";
import { Validation } from "../../services/interfaces/validation";
import { getUserDetailsByWorkerId } from "../../services/firestore/users";
import Svg, { Path } from "react-native-svg";
import TextButton from "../../components/TextButton";
import { calculateAverageRating } from "../../services/firestore/reviews";
import GetProfilePicture from "../../components/GetProfilePicture";
import Badge from "../../components/Badge";
import { getWorker } from "../../services/firestore/workers";
import { Worker } from "../../services/interfaces/worker";
import { User } from "../../services/interfaces/user";
import Pdf from 'react-native-pdf';

interface RouterProps {
    navigation: NavigationProp<any, any>;
    route: Route<string, { workerId: string }>;
}

type workerRatings = {
    averageRating: number,
    reviewCount: number
}

const ViewWorkerProfile = ({ navigation, route }: RouterProps) => {

    const [pdfSource, setPdfSource] = useState<{ uri: string } | null>({ uri: '' });
    const [isLoading, setIsLoading] = useState<boolean>();
    const [workerUser, setWorkerUser] = useState<User | null>();
    const [worker, setWorker] = useState<Worker | null>();
    const [workerRatings, setWorkerRatings] = useState<workerRatings>({
        averageRating: 0,
        reviewCount: 0
    });
    const [address, setAddress] = useState<any>();
    const [validation, setValidation] = useState<Validation | null>(null);

    const id = route.params.workerId ? route.params.workerId : null;

    async function fetchWorkerData(id: string) {
        setIsLoading(true);
        try {
            const [workerUserDetails, workerData] = await Promise.all([
                getUserDetailsByWorkerId(id),
                getWorker(id)
            ]);

            if (!workerUserDetails || !workerData) {
                console.log('Failed to fetch worker profile.');
                return null;
            }

            const [userDetails] = workerUserDetails;
            const { user, address, validation } = userDetails;

            setWorkerUser(user);
            setAddress(address);
            setValidation(validation);
            setWorker(workerData);

            return { user, address, validation, worker: workerData };
        } catch (error) {
            console.error('Error fetching worker data:', error);
            showAlert('Error', 'Failed to fetch worker profile. Please try again later.');
            return null;
        } finally {
            setIsLoading(false);
        }
    }

    async function getWorkerRatings(id: string) {
        const ratings = await calculateAverageRating(id);
        setWorkerRatings(ratings);
    }

    useFocusEffect(
        useCallback(() => {
            let worker = null;
            let ratings = null;

            if (!id) {
                console.log('No worker id provided')
                return;
            }
            try {
                worker = fetchWorkerData(id);
                ratings = getWorkerRatings(id)
            } catch (e) {
                showAlert('Error', 'Failed to fetch worker profile. Please try again later.  ')
            }
            return () => {
                worker = null;
                ratings = null;
            };
        }, [id])
    );

    useEffect(() => {
        if (workerUser && workerRatings && workerUser.pdfPortfolio) {
            setPdfSource({ uri: workerUser.pdfPortfolio });
            setIsLoading(false);
        }
    }, [workerUser, workerRatings]);

    if (isLoading) {
        return (
            <SafeAreaView style={localStyles.container}>
                <View style={[localStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.mediumText}> Loading Worker Profile </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={localStyles.container}>
            <BackButton onPress={async () => navigation.goBack()} />

            <ScrollView>
                <View style={[localStyles.screen]}>
                    <RowItem>
                        <GetProfilePicture type="worker" uuId={id as string} size={90} />
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.largeHeading}> {workerUser?.firstName} {workerUser?.lastName} </Text>
                            <Text style={[localStyles.modeText, styles.mediumTextBlue]}>
                                {validation?.isAccountVerified === true
                                    ? <Badge img="verified" />
                                    : '(unverified)'}
                            </Text>
                        </View>
                        <View style={localStyles.gap} />
                        <View style={localStyles.starsContainer}>
                            {Array.from({ length: 5 }, (_, index) => {
                                const starValue = index + 1;
                                return (
                                    <Svg
                                        key={index}
                                        width={24}
                                        height={24}
                                        viewBox="0 0 24 24"
                                        fill={
                                            workerRatings.averageRating >= starValue
                                                ? Colors.primary
                                                : Colors.placeholder
                                        }>
                                        <Path d="M12 .587l3.668 7.429 8.2 1.193-5.934 5.787 1.401 8.172L12 18.896l-7.335 3.872 1.4-8.172-5.933-5.787 8.2-1.193L12 .587z" />
                                    </Svg>
                                );
                            })}
                        </View>
                        <TextButton
                            title={`( ${workerRatings.reviewCount} ) reviews.`}
                            onPress={async () =>
                                navigation.navigate('WorkerReviews', {
                                    worker_id: route.params.workerId,
                                })
                            }
                        />

                        <Divider />

                        <Text style={styles.boldText}> Biography </Text>
                        <View style={localStyles.gap} />
                        <View style={localStyles.biographyContainer}>
                            <Text style={worker?.bio ? localStyles.biographyText : { textAlign: 'center', color: Colors.placeholder }}>
                                {worker?.bio || "No biography available."}
                            </Text>
                        </View>
                    </RowItem>


                    <RowItem>
                        <Text style={styles.boldText}> Badges </Text>
                        <View style={localStyles.gap} />
                        <View style={localStyles.badgeContainer}>
                            {worker?.badges && worker.badges.length > 0 ? (
                                worker.badges.map((badge) => (
                                    <Badge key={badge} img={badge} />
                                ))
                            ) : (
                                <Text> This worker has no badges. </Text>
                            )}
                        </View>
                    </RowItem>

                    <RowItem>
                        <Text style={styles.boldText}> Portfolio </Text>
                        <View style={localStyles.gap} />

                        {workerUser?.pdfPortfolio ?
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
                                        }}
                                        onPressLink={(uri) => {
                                            console.log(`Link pressed: ${uri}`);
                                        }}
                                        style={localStyles.portfolioImage}
                                    />
                                )}
                            </>
                            :
                            <Text> No portfolio file attached.</Text>
                        }
                    </RowItem>

                    <RowItem>
                        <Text style={styles.boldText}> Certifications </Text>
                        <View style={localStyles.gap} />

                        {workerUser?.certificationImages ?
                            <View>
                                {workerUser?.certificationImages.map((image, index) => (
                                    <Image
                                        key={image}
                                        source={{ uri: image }}
                                        style={localStyles.certImage}
                                    />
                                ))}
                            </View>
                            :
                            <Text> No certifications attached.</Text>
                        }
                    </RowItem>
                </View>
            </ScrollView>
        </SafeAreaView>
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


const localStyles = StyleSheet.create({
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
    biographyContainer: {
        width: '100%',
        padding: 10,
    },
    biographyText: {
        flexWrap: 'wrap',
        fontSize: 16,
        lineHeight: 24,
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
    badgeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
        gap: 4
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.placeholder,
        marginVertical: 16,
    },
    gap: {
        height: 8,
    },
    modeText: {
        flexShrink: 1, // Prevent the text from taking up full width
        color: Colors.labelText, // Use your label text color
        fontSize: 16, // Adjust font size as needed
    },
    profileCard: {
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.placeholder,
        marginVertical: 16,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
        borderWidth: 4,
        borderColor: Colors.primary,
    },
    initialsContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialsText: {
        color: Colors.white,
        fontSize: 24,
        fontWeight: 'bold',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.labelText,
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
    actionBtnGroup: {
        marginVertical: 24,
    },
    btnContainerBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
})
export default ViewWorkerProfile;