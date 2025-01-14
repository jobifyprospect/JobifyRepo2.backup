import React from "react";
import { NavigationProp, Route, useFocusEffect } from "@react-navigation/native";
import { View, Text, SafeAreaView, StyleSheet, Image, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import { styles } from "../../styles/Globals";
import BackButton from "../../components/BackButton";
import { showAlert } from "../../components/AlertDialog";
import { useCallback, useEffect, useState } from "react";
import Colors from "../../styles/Colors";
import { Validation } from "../../services/interfaces/validation";
import { getUserDetailsByClientId2 } from "../../services/firestore/users";
import Svg, { Path } from "react-native-svg";
import TextButton from "../../components/TextButton";
import { calculateAverageRating2 } from "../../services/firestore/reviews";
import GetProfilePicture from "../../components/GetProfilePicture";
import Badge from "../../components/Badge";
import { Client } from "../../services/interfaces/client";
import { User } from "../../services/interfaces/user";
import Pdf from 'react-native-pdf';
import { getClient } from "../../services/firestore/clients";
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { jobsRef } from "../../config/firebase";
import { Job } from "../../services/interfaces/job";
import { getJobCountByClientId } from "../../services/firestore/jobs";

interface RouterProps {
    navigation: NavigationProp<any, any>;
    route: Route<string, { clientId: string }>;
}

type clientRatings = {
    averageRating: number,
    reviewCount: number,
    reviews: FirebaseFirestoreTypes.DocumentData[]
    // reviews: {
    //     clientId: string,
    //     comment: string,
    //     jobTitle: string,
    //     rating: number
    // }[]
}

const ViewClientProfile = ({ navigation, route }: RouterProps) => {

    const [pdfSource, setPdfSource] = useState<{ uri: string } | null>({ uri: '' });
    const [isLoading, setIsLoading] = useState<boolean>();
    const [clientUser, setClientUser] = useState<User | null>();
    const [client, setClient] = useState<Client | null>();
    const [jobCount, setJobCount] = useState<number>(0);
    const [clientRatings, setClientRatings] = useState<clientRatings>({
        averageRating: 0,
        reviewCount: 0,
        reviews: []

    });
    const [address, setAddress] = useState<any>();
    const [validation, setValidation] = useState<Validation | null>(null);

    const id = route.params.clientId ? route.params.clientId : null;


    async function fetchClientData(id: string) {
        setIsLoading(true);
        try {
            const [clientUserDetails, clientData, clientJobCount] = await Promise.all([
                getUserDetailsByClientId2(id),
                getClient(id),
                getJobCountByClientId(id)
            ]);

            if (!clientUserDetails || !clientData) {
                console.log('Failed to fetch client profile.');
                return null;
            }

            const [userDetails] = clientUserDetails;
            const { user, address, validation } = userDetails;

            setClientUser(user);
            setAddress(address);
            setValidation(validation);
            setClient(clientData);
            setJobCount(clientJobCount);

            return { user, address, validation, client: clientData };
        } catch (error) {
            console.error('Error fetching client data:', error);
            showAlert('Error', 'Failed to fetch client profile. Please try again later.');
            return null;
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchClientRatings(id: string) {
        const ratings = await calculateAverageRating2(id);
        setClientRatings(ratings);
    }

    useFocusEffect(
        useCallback(() => {
            let client = null;
            let ratings = null;

            if (!id) {
                console.log('No client id provided')
                return;
            }
            try {
                client = fetchClientData(id);
                ratings = fetchClientRatings(id)
            } catch (e) {
                showAlert('Error', 'Failed to fetch client profile. Please try again later.  ')
            }
            return () => {
                client = null;
                ratings = null;
            };
        }, [id])
    );

    useEffect(() => {
        if (clientUser && clientRatings && clientUser.pdfPortfolio) {
            setIsLoading(false);
        }
    }, [clientUser, clientRatings]);

    useEffect(() => {
        console.log('clientRatings', clientRatings);
    }, [clientRatings]);

    if (isLoading) {
        return (
            <SafeAreaView style={localStyles.container}>
                <View style={[localStyles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.mediumText}> Loading Client Profile </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={localStyles.container}>
            <BackButton onPress={async () => navigation.goBack()} />


            <View style={[localStyles.screen]}>
                <RowItem>
                    <GetProfilePicture type="client" uuId={id as string} size={90} />
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={styles.largeHeading}> {clientUser?.firstName} {clientUser?.lastName} </Text>
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
                                        clientRatings.averageRating >= starValue
                                            ? Colors.primary
                                            : Colors.placeholder
                                    }>
                                    <Path d="M12 .587l3.668 7.429 8.2 1.193-5.934 5.787 1.401 8.172L12 18.896l-7.335 3.872 1.4-8.172-5.933-5.787 8.2-1.193L12 .587z" />
                                </Svg>
                            );
                        })}
                    </View>
                    <Text style={[styles.smallSemiBoldText, { color: Colors.primary }]}> ( Rating from {clientRatings.reviewCount} out of {jobCount} jobs ) </Text>
                    <Text style={[styles.smallSemiBoldText, { color: Colors.primary }]}> Active jobs: {jobCount} </Text>

                    <Text> </Text>
                </RowItem>

                <RowItem>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.mediumText}> Worker Feedback </Text>
                        <Text style={[styles.smallSemiBoldText, { color: Colors.primary }]}> ( {clientRatings.reviewCount} ) </Text>
                    </View>
                    <ScrollView>
                        <View style={localStyles.gap} />
                        <View style={localStyles.divider} />

                        <View style={localStyles.reviewsContainer}>
                            {
                                clientRatings.reviews.map((review, index) => (
                                    <View key={index} style={localStyles.reviewCard}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Text style={[styles.mediumText]}> Job Title: </Text>
                                            <Text style={[styles.mediumTextBlue]}>{review.jobTitle}</Text>
                                        </View>
                                        <View style={localStyles.gap} />
                                        <Text style={[styles.smallText]}>
                                            {review.comment}
                                        </Text>
                                        <View style={localStyles.gap} />

                                        <View style={{ flexDirection: 'row' }}>
                                            {Array.from({ length: 5 }, (_, index) => {
                                                const starValue = index + 1;
                                                return (
                                                    <Svg
                                                        key={index}
                                                        width={24}
                                                        height={24}
                                                        viewBox="0 0 24 24"
                                                        fill={
                                                            review.rating >= starValue
                                                                ? Colors.primary
                                                                : Colors.placeholder
                                                        }>
                                                        <Path d="M12 .587l3.668 7.429 8.2 1.193-5.934 5.787 1.401 8.172L12 18.896l-7.335 3.872 1.4-8.172-5.933-5.787 8.2-1.193L12 .587z" />
                                                    </Svg>
                                                );
                                            })}
                                        </View>

                                    </View>
                                ))
                            }
                        </View>
                    </ScrollView>
                </RowItem>


            </View>

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
    reviewsContainer: {
        rowGap: 10,
    },
    reviewCard: {
        borderWidth: 1,
        borderColor: Colors.primary,
        backgroundColor: Colors.primaryWithOpacity10,
        borderRadius: 5,
        padding: 12,
        width: Dimensions.get('window').width - 80, // Full width minus padding
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
export default ViewClientProfile;