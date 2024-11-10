import { NavigationProp, Route } from '@react-navigation/native';
import BackButton from '../components/BackButton';

import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Image,
    ScrollView,
    Pressable,
} from 'react-native';
import { styles } from '../styles/Globals';
import Colors from '../styles/Colors';
import { useCallback, useEffect, useState } from 'react';
import { getUserDetailsByWorkerId } from '../services/firestore/users';
import { User } from '../services/interfaces/user';
import { Application } from '../services/interfaces/application';
import { applicationsRef, FIRESTORE_TIMESTAMP } from '../config/firebase';
import { Review } from '../services/interfaces/review';
import { getReviewsByAppId } from '../services/firestore/reviews';

interface RouterProps {
    navigation: NavigationProp<any, any>;
    route: Route<string, { worker_id: string, app_id: string }>;
}

export default function WorkerReviews({
    navigation,
    route,
}: RouterProps) {
    console.log('route: ', route.params)
    const params_workerId = route.params.worker_id;

    const [worker, setWorker] = useState<User | null>(null);
    const [reviews, setReviews] = useState<Review[] | null>(null);
    const [applications, setApplications] = useState<Application[] | null>(null);

    const fetchWorkerDetails = useCallback(async () => {
        try {
            if (params_workerId) {
                const workerDetails = await getUserDetailsByWorkerId(params_workerId);
                workerDetails && setWorker(workerDetails);
            }
        } catch (error) {
            console.error('Failed to fetch worker details:', error);
        }
    }, [params_workerId]);

    const fetchWorkerReviews = useCallback(async () => {
        try {
            if (Array.isArray(applications) && applications !== null)  {
                const ids = applications.map((application) => application.applicationId)

                const workerReviews = await getReviewsByAppId(ids);
                
                workerReviews && setReviews(workerReviews);
            }
        } catch (error) {
            console.error('Failed to fetch worker reviews:', error);
        }
    }, [params_workerId]);

    useEffect(() => {
        fetchWorkerDetails();
        fetchWorkerReviews();
    }, [fetchWorkerDetails, fetchWorkerReviews]);

    useEffect(() => {
        if (!params_workerId) {
            console.error('Worker ID is undefined or null');
            return;
        }

        try {
            const unsubscribe = applicationsRef
                .where('workerId', '==', params_workerId)
                .onSnapshot(
                    snapshot => {
                        if (snapshot.empty) {
                            return;
                        }

                        const applications = snapshot.docs[0]?.data() as Application[];

                        setApplications(applications);
                    },
                    error => {
                        console.error('Error getting documents in snapshot:', error);
                    },
                );

            return () => unsubscribe();
        } catch (error) {
            console.error('Error setting up Firestore onSnapshot:', error);
        }
    }, [params_workerId]);

    const initials = `${worker?.firstName ?? ''}${worker?.lastName ?? ''
        }`.toUpperCase();

    console.log('apps: ', applications)
    return (
        <View style={localStyles.container}>
            <SafeAreaView style={localStyles.btnContainerBetween}>
                <BackButton onPress={async () => navigation.goBack()} />
            </SafeAreaView>

            <View style={localStyles.screen}>
                <Text style={styles.largeHeading}> Worker Reviews </Text>
                <ScrollView>
                    <View style={localStyles.reviewContainer}>
                        {/* header */}
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={localStyles.profileContainer}>
                                    {worker?.profilePicture ? (
                                        <Image
                                            source={{ uri: worker?.profilePicture }}
                                            style={localStyles.profileImage}
                                        />
                                    ) : (
                                        <View style={localStyles.initialsContainer}>
                                            <Text style={localStyles.initialsText}>{initials}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.boldText}> John Doe </Text>
                            </View>
                        </View>

                        <View style={{ height: 1, marginVertical: 8, marginHorizontal: 12, backgroundColor: Colors.black }}> <Text> </Text></View>

                        {/* body */}
                        <View>
                            {/* body header */}
                            <View style={localStyles.cardHeader}>
                                <Text> Gardening </Text>
                                <Text> PHP500 </Text>
                            </View>
                            {/* body content */}
                            <View>
                                <View>
                                    <Text> Gardening </Text>
                                    <Text> PHP500 </Text>
                                </View>

                                {/* rating */}
                                <View>

                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}

const localStyles = StyleSheet.create({
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
    btnContainerBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    reviewContainer: {
        backgroundColor: Colors.white,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: Colors.placeholder
    },
    cardHeader: {
        backgroundColor: 'orange',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    profileContainer: {
        marginRight: 10,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 9999,
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
})