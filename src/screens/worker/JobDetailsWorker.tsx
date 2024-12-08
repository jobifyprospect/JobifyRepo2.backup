import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    ScrollView,
    Pressable,
    Modal
} from 'react-native';
import React, { SetStateAction, useCallback, useEffect, useState } from 'react';
import { styles } from '../../styles/Globals';
import Colors from '../../styles/Colors';
import { Job } from '../../services/interfaces/job';
import { getJob } from '../../services/firestore/jobs';
import { NavigationProp, Route } from '@react-navigation/native';
import DynamicButton from '../../components/DynamicButton';
import BackButton from '../../components/BackButton';
import { formatCurrency } from '../../utils/Utils';
import { Application } from '../../services/interfaces/application';
import { applicationsRef, FIRESTORE_TIMESTAMP, timeRecordsRef } from '../../config/firebase';
import { showAlert } from '../../components/AlertDialog';
import { getClientDetails } from '../../services/firestore/roles';
import { createRecord, getTimeRecord, getAll, updateRecord } from '../../services/firestore/time_records';
import uuid from 'react-native-uuid';
import { formatDateToReadable, formatDate } from '../../utils/Utils';
import moment from 'moment';
import { TimeRecord } from '../../services/interfaces/time_records';
import { getCurrentUserUID, getIdByRoleId, getUser, getUserDetailsByClientId, getUserDetailsByWorkerId } from '../../services/firestore/users';
import { Notification } from '../../services/interfaces/notification';
import { createNotification } from '../../services/firestore/notifications';

interface RouterProps {
    navigation: NavigationProp<any, any>;
    route: Route<string, { id: string }>;
}

export default function JobDetailsWorker({ navigation, route }: RouterProps) {
    const id = route.params.id;
    const [client, setClient] = useState<{
        fullName?: string;
        phoneNumber?: string;
        email?: string;
    }>();
    const [job, setJob] = useState<Job>();
    const [loading, setIsLoading] = useState<boolean>(false);
    const [isDone, setIsDone] = useState<Boolean>(false);
    const [refreshing, setRefreshing] = useState(false); // State to track refreshing
    const [currentScreen, setCurrentScreen] = useState<'Listing' | 'Actions'>(
        'Listing',
    );
    const [isConfirmingTimeIn, setIsConfirmingTimeIn] = useState<boolean>(false);
    const [isConfirmingTimeOut, setIsConfirmingTimeOut] = useState<boolean>(false);
    const [currentUserId, setCurrentUserId] = useState<any>(null);
    const [application, setApplication] = useState<Application>();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [record, setRecord] = useState<TimeRecord>();
    const [hasRecord, setHasRecord] = useState<boolean>(false)
    const [isAccepted, setIsAccepted] = useState<boolean>(false)

    async function fetchTimeRecords() {

        const res = job && await getTimeRecord(job.jobId, job.assignedWorker)
        if (res !== null) {
            setRecord(res)
            setHasRecord(true)
            if (res?.acceptedBy !== "") {
                setIsAccepted(true)
            } else {
                setIsAccepted(false)
            }
        }
        console.log('res for time records: ', res)
    }
    const fetchJobAndApplicants = useCallback(async () => {
        setIsLoading(true); // Set loading to true at the start
        try {
            if (id) {
                // Fetch job and applicants simultaneously
                const [jobData] = await Promise.all([getJob(id)]);

                // Update states with fetched data
                jobData && setJob(jobData);
                setIsDone(job?.status === 'closed');
            }
        } catch (error) {
            console.error('Error fetching job or applicants:', error);
        } finally {
            setIsLoading(false); // Set loading to false after both fetches are completed
            setRefreshing(false); // Stop refreshing if applicable
        }
    }, [id, job?.clientId, job?.status, job?.title]);

    const handleOpenMap = () => {
        if (job?.mapLocation?.longitude && job?.mapLocation?.latitude) {
            navigation.navigate('MapScreen', {
                longitude: job.mapLocation.longitude,
                latitude: job.mapLocation.latitude,
            });
        } else {
            showAlert(
                'Error',
                'Location coordinates are not available for this job.',
            );
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true); // Start the refreshing spinner
        fetchJobAndApplicants(); // Refresh both job and applicants
    }, [fetchJobAndApplicants]);

    async function getClientInfo() {
        const res = job && await getClientDetails(job.clientId)
        setClient(res)
    }

    async function timeIn() {
        setIsSubmitting(true)
        const payload: TimeRecord = {
            id: uuid.v4().toString(),
            jobId: id,
            workerId: job?.assignedWorker,
            clientId: job?.clientId,
            applicationId: application?.applicationId,
            acceptedBy: '',
            time_in: FIRESTORE_TIMESTAMP,
        }

        await createRecord(payload)

        const receiverDetails = await getUserDetailsByClientId(job?.clientId as string);
        const receiverId = receiverDetails?.userId as string;
        const name = `${receiverDetails?.firstName} ${receiverDetails?.lastName}`

        // Create and send notification
        const notificationData: Notification = {
            id: uuid.v4().toString(), // Generate a unique notification ID
            title: 'Worker Time in',
            subtitle: `${name} has timed in for ${job?.title}`,
            senderId: currentUserId,
            receiverId: receiverId,
            isRead: false,
            createdAt: FIRESTORE_TIMESTAMP,
            updatedAt: FIRESTORE_TIMESTAMP
        };

        await createNotification(notificationData);
        setIsSubmitting(false);
        setIsConfirmingTimeIn(false)
        showAlert('Success', 'Timed in.')
    }

    async function timeOut() {
        setIsSubmitting(true)
        const payload: Partial<TimeRecord> = {

            time_out: FIRESTORE_TIMESTAMP,
        }
        await updateRecord(payload, record?.id)

        const receiverDetails = await getUserDetailsByClientId(job?.clientId as string);
        const receiverId = receiverDetails?.userId as string;
        const name = `${receiverDetails?.firstName} ${receiverDetails?.lastName}`

        // Create and send notification
        const notificationData: Notification = {
            id: uuid.v4().toString(), // Generate a unique notification ID
            title: 'Time Out Request',
            subtitle: `${name} has requested to time out for ${job?.title}`,
            senderId: currentUserId,
            receiverId: receiverId,
            isRead: false,
            createdAt: FIRESTORE_TIMESTAMP,
            updatedAt: FIRESTORE_TIMESTAMP
        };

        await createNotification(notificationData);
        setIsSubmitting(false);
        setIsConfirmingTimeOut(false)
        showAlert('Success', 'Time out request sent for client approval.')
    }

    useEffect(() => {
        const fetchCurrentUserId = async () => {
            try {
                const uid: string | null = await getCurrentUserUID();
                if (uid) {
                    const currentUserData = await getUser(uid);

                    if (currentUserData && currentUserData.defaultRole) {
                        const clientIdByRole = await getIdByRoleId(
                            currentUserData.defaultRole,
                        );
                        setCurrentUserId(clientIdByRole?.workerId || null);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user ID:', error);
                showAlert('Error', 'Failed to fetch user ID.');
            }
        };

        fetchCurrentUserId();
    }, []);

    useEffect(() => {
        getClientInfo();
    }, [job])

    useEffect(() => {
        fetchJobAndApplicants(); // Initial fetch when the component mounts
    }, [fetchJobAndApplicants]);

    useEffect(() => {
        if (job) {
            fetchTimeRecords()
        }
    }, [job])

    useEffect(() => {
        if (job?.jobId) {
            const unsubscribe = applicationsRef
                .where('jobId', '==', job.jobId)
                .where('workerId', '==', currentUserId)
                .onSnapshot(
                    snapshot => {
                        const applicationData = snapshot.docs.map(doc =>
                            doc.data(),
                        ) as Application[];
                        setApplication(applicationData[0]);
                        setIsLoading(false);
                    },
                    error => {
                        console.error('Error getting documents:', error);
                    },
                );
            return () => unsubscribe();
        }
    }, [job?.jobId]);

    useEffect(() => {
        if (job?.jobId) {
            const unsubscribe = timeRecordsRef
                .where('jobId', '==', job.jobId)
                .where('workerId', '==', currentUserId)
                .onSnapshot(
                    snapshot => {
                        const timeRecordsData = snapshot.docs.map(doc =>
                            doc.data(),
                        ) as TimeRecord[];
                        setRecord(timeRecordsData[0]);
                        setIsLoading(false);
                    },
                    error => {
                        console.error('Error getting documents:', error);
                    },
                );
            return () => unsubscribe();
        }
    }, [job?.jobId]);



    if (loading && !refreshing) {
        return (
            <View style={localStyles.contentLoading}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.mediumText}> Loading Details.. </Text>
            </View>
        );
    }

    return (
        <View style={localStyles.container}>
            <SafeAreaView style={localStyles.btnContainerBetween}>
                <BackButton onPress={async () => navigation.goBack()} />
            </SafeAreaView>
            <View>
                <View style={localStyles.row}>
                    <Text style={localStyles.pageHeader}>
                        {job?.title} - {job?.status === 'closed' ? 'Done' : job?.status}
                    </Text>
                </View>
            </View>

            <View style={{ backgroundColor: 'white', padding: 8, marginBottom: 10 }}>
                <Text style={styles.mediumText}>
                    Client:
                </Text>
                <Text style={styles.mediumTextBlue}>
                    {client?.fullName}
                </Text>
                <Text style={styles.boldText}>
                    {client?.phoneNumber}
                </Text>
                <Text style={styles.boldText}>
                    {client?.email}
                </Text>
            </View>

            <View style={localStyles.containTab}>
                <Pressable
                    style={[
                        styles.w100,
                        localStyles.tabStyle,
                        currentScreen === 'Listing'
                            ? {}
                            : { backgroundColor: Colors.placeholder },
                    ]}
                    onPress={() => setCurrentScreen('Listing')}>
                    <Text style={localStyles.centerText}>Job Listing</Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.w100,
                        localStyles.tabStyle,
                        currentScreen === 'Actions'
                            ? {}
                            : { backgroundColor: Colors.placeholder },
                    ]}
                    onPress={() => setCurrentScreen('Actions')}>
                    <Text style={localStyles.centerText}>Actions</Text>
                </Pressable>
            </View>

            {currentScreen === 'Listing' ?
                <View style={localStyles.sectionContainer}>
                    <ScrollView>
                        <View style={styles.card}>
                            <View style={localStyles.cardContent}>
                                <View style={localStyles.contentRow}>
                                    <Text style={localStyles.cardContentHeader}>
                                        Additional Info
                                    </Text>
                                    <Text style={localStyles.contentTextRegular}>
                                        {job?.description}
                                    </Text>
                                </View>

                                <View style={localStyles.contentRow}>
                                    <Text style={localStyles.cardContentHeader}>Location </Text>
                                    <Text style={localStyles.contentTextRegular}>
                                        {job?.location}
                                    </Text>
                                    <DynamicButton
                                        title="View"
                                        type="primary"
                                        onPress={handleOpenMap}
                                    />
                                </View>

                                <View style={localStyles.contentRow}>
                                    <Text style={localStyles.cardContentHeader}>Schedule</Text>
                                    <Text style={localStyles.contentTextRegular}>
                                        {job?.schedule}
                                    </Text>
                                </View>
                            </View>

                            <View style={localStyles.cardFooter}>
                                <Text style={localStyles.cardContentHeader}>Rate / hr </Text>
                                <Text style={localStyles.footerTextXL}>
                                    {formatCurrency(job?.pay ?? 0)}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>
                :
                <View style={localStyles.sectionContainer}>
                    <ScrollView>
                        {record && record?.time_in ? <Text style={styles.bold}> You timed in at: {formatDate(record.time_in)}</Text> : null}
                        {record && record?.time_out ? <Text style={styles.bold}> You timed out at: {formatDate(record.time_out)}</Text> : null}
                        <DynamicButton disabled={record?.time_in ? true : false} type='primary' title='Time in' onPress={() => setIsConfirmingTimeIn(true)} />
                        <DynamicButton disabled={record?.time_in && !record?.time_out ? false : true} type='primary' title='Time out' onPress={() => setIsConfirmingTimeOut(true)} />

                        {record?.time_out ?
                            <>
                                {record?.acceptedBy !== "" ? <Text> Your time has been approved by the client. </Text> : <Text> You have sent a time-out request but it has not yet been approved by your client. </Text>}
                            </>
                            :
                            null
                        }
                    </ScrollView>
                </View>
            }

            <ConfirmTimeInDialog setIsConfirming={setIsConfirmingTimeIn} isConfirming={isConfirmingTimeIn} onConfirmTimeIn={timeIn} />
            <ConfirmTimeOutDialog setIsConfirming={setIsConfirmingTimeOut} isConfirming={isConfirmingTimeOut} onConfirmTimeOut={timeOut} />
        </View>
    );
}

function ConfirmTimeInDialog({ setIsConfirming, isConfirming, onConfirmTimeIn }: { setIsConfirming: SetStateAction<any>, isConfirming: boolean, onConfirmTimeIn: () => any }) {

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isConfirming}
            onRequestClose={() => {
                setIsConfirming(false);
            }}>
            <View style={{ display: 'flex', flexDirection: 'column', flex: 0.3, marginVertical: 'auto', padding: 12 }}>
                <View style={{ backgroundColor: 'white', flex: 1, justifyContent: 'space-around', alignItems: 'center', borderRadius: 12 }}>
                    <View>
                        <Text style={styles.mediumTextBlue}>Confirm Action</Text>
                    </View>

                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={styles.regularText}> Time in at </Text>
                        <Text style={styles.mediumTextBlue}> {moment().format('hh:mm A')}? </Text>
                    </View>

                    <View style={{ width: 240 }}>
                        <DynamicButton title="Confirm" type="secondary" onPress={async () => onConfirmTimeIn()} />
                        <DynamicButton title="Cancel" type="destructive" onPress={() => setIsConfirming(false)} />
                    </View>
                </View>
            </View>
        </Modal>
    )
}

function ConfirmTimeOutDialog({ setIsConfirming, isConfirming, onConfirmTimeOut }: { setIsConfirming: SetStateAction<any>, isConfirming: boolean, onConfirmTimeOut: () => any }) {

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isConfirming}
            onRequestClose={() => {
                setIsConfirming(false);
            }}>
            <View style={{ display: 'flex', flexDirection: 'column', flex: 0.3, marginVertical: 'auto', padding: 12 }}>
                <View style={{ backgroundColor: 'white', flex: 1, justifyContent: 'space-around', alignItems: 'center', borderRadius: 12 }}>
                    <View>
                        <Text style={styles.mediumTextBlue}>Confirm Action</Text>
                    </View>

                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={styles.regularText}> Time out at </Text>
                        <Text style={styles.mediumTextBlue}> {moment().format('hh:mm A')}? </Text>
                    </View>

                    <View style={{ width: 240 }}>
                        <DynamicButton title="Confirm" type="secondary" onPress={async () => onConfirmTimeOut()} />
                        <DynamicButton title="Cancel" type="destructive" onPress={() => setIsConfirming(false)} />
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const localStyles = StyleSheet.create({
    profileContainer: {
        marginRight: 10,
    },
    containText: {
        alignItems: 'flex-start',
        marginLeft: 'auto',
    },
    refreshIndicator: {
        flex: 1,
        rowGap: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 150,
    },
    centerText: { textAlign: 'center' },
    tabStyle: {
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    containTab: {
        borderWidth: 1,
        borderColor: Colors.placeholder,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        maxWidth: 200,
        borderRadius: 5,
    },
    contentLoading: {
        flex: 1,
        rowGap: 14,
        alignItems: 'center',
        justifyContent: 'center',
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

    cardHeader: {
        flexWrap: 'nowrap',
        alignItems: 'center',
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
        fontWeight: '400',
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
        fontWeight: '600',
    },
    avatarPlaceholder: {
        height: 52,
        textAlign: 'center',
        textAlignVertical: 'center',
        color: Colors.primary,
        fontSize: 18,
    },
});
