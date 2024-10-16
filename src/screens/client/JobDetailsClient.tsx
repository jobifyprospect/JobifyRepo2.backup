import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable, FlatList, Image, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { styles } from '../../styles/Globals';
import Colors from '../../styles/Colors';
import { Job } from '../../services/interfaces/job';
import { getJob } from '../../services/firestore/jobs';
import { NavigationProp, Route, useFocusEffect } from '@react-navigation/native';
import RefreshButton from '../../components/RefreshComponent';
import DynamicButton from '../../components/DynamicButton';
import BackButton from '../../components/BackButton';
import { formatDateToReadable } from '../../utils/Utils';
import { getApplicationsByJobId } from '../../services/firestore/applications';
import { Application } from '../../services/interfaces/application';
import { getCurrentUserUID } from '../../config/firebase';
import { getUser } from '../../services/firestore/users';
import { getWorker } from '../../services/firestore/workers';
import { Worker } from '../../services/interfaces/worker';
import { deleteJob } from '../../services/firestore/jobs';
import { showAlert } from '../../components/AlertDialog';

interface RouterProps {
    navigation: NavigationProp<any, any>;
    route: Route<string, { id: string }>
}

export default function JobDetailsClient({ navigation, route }: RouterProps) {

    const id = route.params.id

    const [job, setJob] = useState<Job>();
    const [applicants, setApplicants] = useState<Application[]>()
    const [worker, setWorker] = useState<Worker | undefined>()

    const [loading, setIsLoading] = useState<boolean>(false)
    const [currentScreen, setCurrentScreen] = useState<'Listing' | 'Applicants'>('Listing')
    const [currentUserId, setCurrentUserId] = useState<any>(null)
    const [refreshing, setRefreshing] = useState(false); // State to track refreshing

    async function fetchMyRoleId() {
        try {
            const uid = await getCurrentUserUID();
            if (uid) {
                const currentRole = await getUser(uid)
                setCurrentUserId(currentRole?.defaultRole)
            }
        } catch (err) {
            console.error('something went wrong while fetching user')
        }
    }

    const fetchJob = useCallback(async () => {
        try {
            if (id) {
                const jobs = await getJob(id);

                jobs && setJob(jobs);
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        }
    }, [job]);

    const fetchApplicants = useCallback(async () => {
        try {
            if (id) {
                const applicants = await getApplicationsByJobId(id);

                applicants && setApplicants(applicants);
            }
        } catch (error) {
            console.error('Failed to fetch applicants:', error);
        } finally {
            setRefreshing(false); // Stop the refreshing spinner
        }
    }, [applicants]);

    // const fetchWorkerDetails = useCallback(async (worker_id: string) => {
    //     if (!worker_id) { return }

    //     try {
    //         console.log('running fetchWorkerDetails function')
    //         if (id) {
    //             const workerDetails = await getWorker(worker_id);

    //             worker && setWorker(workerDetails);
    //         }
    //     } catch (error) {
    //         console.error('Failed to fetch worker details:', error);
    //     } finally {
    //         setRefreshing(false); // Stop the refreshing spinner
    //     }
    // }, [worker]);

    async function handleDeleteJob(id: string) {

        if (!id) { showAlert('error', 'No job found.') }

        try {
            await deleteJob(id)
        } catch (e) {
            console.error(e)
        }
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true); // Start the refreshing spinner
        fetchApplicants(); // Refresh the applicants list
    }, [fetchApplicants]);

    useEffect(() => {
        fetchJob(); // Initial fetch when the component mounts'
        fetchApplicants()
    }, []);

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true)
            if (currentUserId === null) { fetchMyRoleId() }
        }, [currentUserId]),
    );


    function returnJobStatus(status: string | undefined) {
        switch (status) {
            case 'on going':
                return Colors.primary;
            default:
                return Colors.placeholder;
        }
    }

    return (
        <View style={localStyles.container}>
            <SafeAreaView style={localStyles.btnContainerBetween}>
                <BackButton onPress={async () => navigation.goBack()} />

                {
                    currentScreen === 'Listing' && <DynamicButton onPress={() => undefined} title='Edit' />
                }

                {
                    currentScreen === 'Applicants' && <RefreshButton
                        type="primary"
                        onPress={() => onRefresh()}
                        disabled={refreshing} // Disable button when refreshing
                    />
                }
            </SafeAreaView>

            <View>
                <Text style={localStyles.pageHeader}> {job?.title} </Text>
                <View style={{ borderWidth: 1, borderColor: Colors.placeholder, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, maxWidth: 200, borderRadius: 5 }}>
                    <Pressable
                        style={[styles.w100, { paddingVertical: 12, alignItems: 'center', justifyContent: 'center' }, currentScreen === 'Listing' ? { backgroundColor: Colors.placeholder } : {},]}
                        onPress={() => setCurrentScreen('Listing')}
                    >
                        <Text style={{ textAlign: 'center' }}> Job Listing </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.w100, { paddingVertical: 12, alignItems: 'center', justifyContent: 'center' }, currentScreen === 'Applicants' ? { backgroundColor: Colors.placeholder } : {},]}
                        onPress={() => setCurrentScreen('Applicants')}
                    >
                        <Text style={{ textAlign: 'center' }}> Applicants </Text>
                    </Pressable>
                </View>
            </View>

            <>
                {
                    currentScreen === 'Listing' ?
                        <View style={localStyles.sectionContainer}>
                            <View style={localStyles.card}>

                                <View style={localStyles.cardContent}>
                                    <View style={localStyles.contentRow}>
                                        <Text style={localStyles.cardContentHeader}> Additional Info </Text>
                                        <Text style={localStyles.contentTextRegular}> {job?.description}  </Text>
                                    </View>

                                    <View style={localStyles.contentRow}>
                                        <Text style={localStyles.cardContentHeader}> Location </Text>
                                        <Text style={localStyles.contentTextRegular}> {job?.location}  </Text>
                                    </View>

                                    <View style={localStyles.contentRow}>
                                        <Text style={localStyles.cardContentHeader}> Schedule </Text>
                                        <Text style={localStyles.contentTextRegular}> {job?.schedule}  </Text>
                                    </View>
                                </View>

                                <View style={localStyles.cardFooter}>
                                    <Text style={localStyles.cardContentHeader}> Rate / hr </Text>
                                    <Text style={localStyles.footerTextXL}> PHP {job?.pay}.00  </Text>

                                    <DynamicButton type='destructive' onPress={() => handleDeleteJob(job?.jobId as string)} title='Delete' />
                                </View>

                            </View>
                        </View>
                        :
                        <View>
                            {
                                !applicants || refreshing ?
                                    <View style={{ flex: 1, rowGap: 14, alignItems: 'center', justifyContent: 'center', marginTop: 150 }}>
                                        <ActivityIndicator
                                            size="large"
                                            color={Colors.primary}
                                        />
                                        <Text style={styles.mediumText}> Loading Details.. </Text>
                                    </View>
                                    :
                                    <FlatList
                                        style={localStyles.flatList} // Style for the FlatList
                                        removeClippedSubviews={false}
                                        ListEmptyComponent={<Text> No applications for this listing yet. </Text>}
                                        data={applicants} // Display searchResults instead of myListings
                                        renderItem={({ item, index }) => {
                                            const currentItemDate = formatDateToReadable(item.createdAt);
                                            const previousItemDate =
                                                index > 0
                                                    ? formatDateToReadable(applicants[index - 1].createdAt)
                                                    : null;
                                            const nextItemDate =
                                                index < applicants.length - 1
                                                    ? formatDateToReadable(applicants[index + 1].createdAt)
                                                    : null;

                                            const isGroupStart = currentItemDate !== previousItemDate;
                                            const isGroupEnd = currentItemDate !== nextItemDate;

                                            const getCardStyle = () => {
                                                if (isGroupStart && isGroupEnd) {
                                                    return {
                                                        borderRadius: 8,
                                                        borderWidth: 0,
                                                    };
                                                } else if (isGroupStart) {
                                                    return {
                                                        borderTopLeftRadius: 8,
                                                        borderTopRightRadius: 8,
                                                        borderBottomLeftRadius: 0,
                                                        borderBottomRightRadius: 0,
                                                        borderBottomWidth: 1,
                                                    };
                                                } else if (isGroupEnd) {
                                                    return {
                                                        borderTopLeftRadius: 0,
                                                        borderTopRightRadius: 0,
                                                        borderBottomLeftRadius: 8,
                                                        borderBottomRightRadius: 8,
                                                        borderBottomWidth: 0,
                                                    };
                                                } else {
                                                    return {
                                                        borderRadius: 0,
                                                        borderBottomWidth: 1,
                                                    };
                                                }
                                            };

                                            return (
                                                <>
                                                    {isGroupStart && (
                                                        <View style={localStyles.containHeader}>
                                                            <Text style={styles.smallSemiBoldText}>
                                                                {currentItemDate}
                                                            </Text>
                                                        </View>
                                                    )}
                                                    <Pressable
                                                        onPress={() => navigation.navigate('AcceptOrDeclineApplicant', { worker_id: item.workerId, job_id: job?.jobId, app_id: item.applicationId, app_status: item.status, offer: item.offer })}
                                                        key={item.jobId}
                                                        style={[localStyles.jobCard, getCardStyle()]}
                                                    >
                                                        <View style={localStyles.containItems}>
                                                            <View style={localStyles.column}>
                                                                <Text style={[styles.boldText]}>
                                                                    {item.workerId}
                                                                </Text>

                                                                <View style={localStyles.row}>
                                                                    <Text style={[styles.smallText]}> {job?.title} </Text>
                                                                    <Text style={styles.smallText}> - </Text>
                                                                    <Text style={[styles.smallText]}> PHP {job?.pay} </Text>
                                                                </View>
                                                            </View>

                                                            <View style={{ alignItems: 'flex-start', marginLeft: 'auto' }}>
                                                                <Text style={[{ color: Colors.black, fontWeight: '500' }]}>
                                                                    Offer
                                                                </Text>
                                                                <Text style={[{ color: Colors.primary, fontWeight: '500' }]}>
                                                                    PHP {item.offer ? item.offer : null}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </Pressable>
                                                </>
                                            );
                                        }}
                                    />
                            }
                        </View>
                }
            </>
        </View>
    );
}

const localStyles = StyleSheet.create({
    profileContainer: {
        marginRight: 10,
    },
    profileImage: {
        width: 80,
        height: 80,
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
    flatList: {
        marginBottom: 100,
    },
    containHeader: {
        paddingTop: 12,
        paddingBottom: 12,
    },
    containItems: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 18,
    },
    row: { flexDirection: 'row' },
    column: { flexDirection: 'column' },
    statusText: {
        marginLeft: 'auto',
    },
    container: {
        paddingHorizontal: 30,
        paddingTop: 25,
        flex: 1,
    },
    btnContainerBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pageHeader: {
        color: Colors.primary,
        fontSize: 24,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 12,
    },
    sectionContainer: {
        rowGap: 8,
        marginVertical: 6,
        flex: 1,
        marginTop: 32,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    card: {
        borderWidth: 1,
        shadowOpacity: 1,
        borderColor: Colors.primaryWithOpacity10,
        shadowColor: Colors.primaryWithOpacity10,
        flexDirection: 'column',
        backgroundColor: Colors.white,
        borderRadius: 5,
        paddingHorizontal: 24,
        rowGap: 24,
    },
    cardHeader: {
        flexWrap: 'nowrap',
        alignItems: "center",
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingBottom: 16,
        borderColor: Colors.placeholder,
        borderBottomWidth: 1,
        borderBottomColor: Colors.placeholder,

    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    cardContentHeader: {
        fontSize: 16,
        fontWeight: "400",
    },
    contentTextRegular: {
        fontSize: 14,
        fontWeight: '300',
    },
    cardContent: {
        paddingTop: 32,
        rowGap: 10,
    },
    contentRow: {
        rowGap: 6,
        paddingTop: 0,
        paddingBottom: 16,
        borderColor: Colors.placeholder,
        borderBottomWidth: 1,
        borderBottomColor: Colors.placeholder,
    },
    cardFooter: {
        paddingBottom: 24,
        rowGap: 24,
    },
    footerTextXL: {
        fontSize: 32,
        textAlign: 'right',
        fontWeight: '600',
    },
    jobCard: {
        borderWidth: 1,
        shadowOpacity: 1,
        borderColor: Colors.primaryWithOpacity10,
        shadowColor: Colors.primaryWithOpacity10,
        backgroundColor: Colors.white,
        paddingVertical: 15,
        borderRadius: 5,
        paddingHorizontal: 8,
    },
    jobCardAvatar: {
        minHeight: 52,
        minWidth: 52,
        maxHeight: 52,
        maxWidth: 52,
        backgroundColor: Colors.primaryWithOpacity10,
        borderRadius: 100,
    },
    jobCardName: {
        fontSize: 24,
        fontWeight: '600'
    },
    avatarPlaceholder: {
        height: 52,
        textAlign: 'center',
        textAlignVertical: 'center',
        color: Colors.primary,
        fontSize: 18,
    },
});
