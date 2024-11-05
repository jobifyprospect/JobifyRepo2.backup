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
    const params_appId = route.params.app_id;

    const [fetchingWorker, setIsFetchingWorker] = useState<boolean>(false)
    
    const [worker, setWorker] = useState<User | null>(null);
    const [application, setApplication] = useState<Application | null>(null);

    const fetchWorkerDetails = useCallback(async () => {
        setIsFetchingWorker(true);
        try {
            if (params_workerId) {
                const workerDetails = await getUserDetailsByWorkerId(params_workerId);
                workerDetails && setWorker(workerDetails);
            }
        } catch (error) {
            console.error('Failed to fetch worker details:', error);
        } finally {
            setIsFetchingWorker(false);
        }
    }, [params_workerId]);

    useEffect(() => {
        fetchWorkerDetails();
    }, [fetchWorkerDetails]);

    useEffect(() => {
        if (!params_appId) {
          console.error('params_appId is undefined or null');
          return;
        }
    
        try {
          const unsubscribe = applicationsRef
            .where('applicationId', '==', params_appId)
            .onSnapshot(
              snapshot => {
                if (snapshot.empty) {
                  return;
                }
    
                const applicationData = snapshot.docs[0]?.data() as Application;
    
                setApplication(applicationData);
              },
              error => {
                console.error('Error getting documents in snapshot:', error);
              },
            );
    
          return () => unsubscribe();
        } catch (error) {
          console.error('Error setting up Firestore onSnapshot:', error);
        }
      }, [params_appId]);

    const initials = `${worker?.firstName ?? ''}${worker?.lastName ?? ''
        }`.toUpperCase();


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