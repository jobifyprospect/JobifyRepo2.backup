import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Image } from "react-native"
import BackButton from "../../components/BackButton"
import Colors from "../../styles/Colors"
import { NavigationProp, Route } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Worker } from "../../services/interfaces/worker";
import { getWorker } from "../../services/firestore/workers";
import { User } from "../../services/interfaces/user";
import { getUserDetailsByWorkerId } from "../../services/firestore/users";
import { getJob } from "../../services/firestore/jobs";
import { Job } from "../../services/interfaces/job";
import { styles } from "../../styles/Globals";
import { getAddress } from "../../services/firestore/addresses";
import { Address } from "../../services/interfaces/address";
import { updateApplication } from "../../services/firestore/applications";
import { Application } from "../../services/interfaces/application";
import DynamicButton from "../../components/DynamicButton";
import { FIRESTORE_DB, FIRESTORE_TIMESTAMP } from "../../config/firebase";


interface RouterProps {
    navigation: NavigationProp<any, any>;
    route: Route<string, { worker_id: string, job_id: string, app_id: string }>
}

export default function AcceptOrDeclineApplicant({ navigation, route }: RouterProps) {

    const params_workerId = route.params.worker_id
    const params_jobId = route.params.job_id
    const params_appId = route.params.app_id

    const [worker, setWorker] = useState<User | null>()
    const [workerAddy, setWorkerAddy] = useState<Address | null>()
    const [application, setApplication] = useState<Application | null>();
    const [isSubmitting, setIsSubmitting] = useState<boolean>();
    const [job, setJob] = useState<Job | null>()
    const [loading, setIsLoading] = useState<boolean>(true)

    const fetchWorkerDetails = useCallback(async () => {
        try {
            if (params_workerId) {
                const workerDetails = await getUserDetailsByWorkerId(params_workerId);

                workerDetails && setWorker(workerDetails);
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        }
    }, [worker]);

    const fetchJob = useCallback(async () => {
        try {
            if (params_jobId) {
                const jobs = await getJob(params_jobId);

                jobs && setJob(jobs);
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        }
    }, [job]);

    async function handleApplicationStatusUpdate(type: "rejected" | "accepted") {
        setIsSubmitting(true);
        try {
            const payload: Partial<Application> = {
                status: type,
                updatedAt: FIRESTORE_TIMESTAMP
            }

            if (params_appId !== null && params_appId !== undefined) {
                const res = await updateApplication(params_appId, payload);

                setIsSubmitting(false);
            }
        } catch (error) {
            setIsSubmitting(false);
            console.error('Failed to update application status:', error);
        }
    };

    const fetchAddy = useCallback(async () => {
        while (!worker) { return }
        try {
            const addy = await getAddress(worker?.addressId as string);
            addy && setWorkerAddy(addy);
        } catch (error) {
            console.error('Failed to fetch addy:', error);
        } finally {
            setIsLoading(false); // Stop the refreshing spinner
        }
    }, [workerAddy, worker]);

    useEffect(() => {
        fetchJob();
        fetchWorkerDetails();
    }, [])

    useEffect(() => {
        fetchAddy();
    }, [worker])

    //subscribe to changes to db.
    useEffect(() => {
        const applicationsRef = FIRESTORE_DB.collection('applications')
        const unsubscribe = applicationsRef
            .where('applicationId', '==', params_appId)
            .onSnapshot(
                snapshot => {
                    const applicationData = snapshot.docs[0].data() as Application;
                    setApplication(applicationData); // Update state with new data
                    setIsLoading(false)
                },
                error => {
                    console.error('Error getting documents:', error);
                },
            );

        return () => unsubscribe(); // Cleanup listener on unmount
    }, []);

    const initials = `${worker?.firstName}${worker?.lastName}`.toUpperCase();

    if (loading)
        return (
            <View style={{ flex: 1, rowGap: 14, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator
                    size="large"
                    color={Colors.primary}
                />
                <Text style={styles.mediumText}> Loading Details.. </Text>
            </View>
        )


    return (
        <View style={localStyles.container}>
            <SafeAreaView style={localStyles.btnContainerBetween}>
                <BackButton onPress={async () => navigation.goBack()} />
            </SafeAreaView>

            <View style={localStyles.screen}>
                <Text style={styles.largeHeading}> {job?.title} </Text>
                <View style={localStyles.card}>

                    <View style={localStyles.contentRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={localStyles.profileContainer}>
                                {worker?.profilePicture ? (
                                    <Image
                                        source={{ uri: worker?.profilePicture }}
                                        style={localStyles.profileImage}
                                    />
                                ) : (
                                    <View style={localStyles.initialsContainer}>
                                        <Text style={localStyles.initialsText}>
                                            {initials}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text style={{ fontWeight: '600', fontSize: 24 }}> {worker?.firstName} {worker?.lastName} </Text>
                        </View>
                    </View>

                    <View style={localStyles.cardContent}>
                        <View style={localStyles.contentRow}>
                            <Text style={localStyles.cardContentHeader}> Contact Info </Text>
                            <Text style={localStyles.contentTextRegular}> {worker?.phoneNumber} </Text>
                        </View>
                        <View style={localStyles.contentRow}>
                            <View>
                                <Text style={localStyles.cardContentHeader}> Address </Text>
                                <Text style={localStyles.contentTextRegular}>
                                    {workerAddy?.city}, {workerAddy?.postalCode} {workerAddy?.province}, {workerAddy?.region}, {workerAddy?.country}.
                                </Text>
                            </View>
                        </View>

                        <View style={localStyles.contentRow}>
                            <View>
                                <Text style={localStyles.cardContentHeader}> About Me </Text>
                                <Text style={localStyles.contentTextRegular}>
                                    Hardworking individual willing to go above and beyond within the given job description.
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={localStyles.cardFooter}>
                        <Text style={localStyles.cardContentHeader}> Asking Rate / hr </Text>
                        <Text style={localStyles.footerTextXL}> PHP {application?.offer}.00  </Text>

                        <View style={localStyles.actionBtnGroup}>
                            {application &&
                                <>
                                    {application.status === 'pending' && (
                                        <>
                                            <DynamicButton onPress={() => handleApplicationStatusUpdate('accepted')} disabled={isSubmitting} type="primary" title="Accept Application" />
                                            <DynamicButton onPress={() => handleApplicationStatusUpdate('rejected')} disabled={isSubmitting} type="secondary" title="Decline" />
                                        </>
                                    )}
                                    {application.status === 'accepted' && <DynamicButton onPress={() => undefined} title="Application accepted." disabled />}
                                    {application.status === 'rejected' && <DynamicButton onPress={() => undefined} title="Application rejected." disabled />}
                                </>
                            }
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}


const localStyles = StyleSheet.create({
    actionBtnGroup: {
        marginVertical: 24,
    },
    container: {
        paddingHorizontal: 30,
        paddingTop: 25,
        flex: 1,
    },
    screen: {
        flex: 1,
        paddingTop: 24,
        rowGap: 24
    },
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
    btnContainerBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sectionContainer: {
        rowGap: 8,
        marginVertical: 6,
    },
    card: {
        borderWidth: 1,
        shadowOpacity: 1,
        borderColor: Colors.primaryWithOpacity10,
        shadowColor: Colors.primaryWithOpacity10,
        flexDirection: 'column',
        backgroundColor: Colors.white,
        borderRadius: 5,
        padding: 24,
        rowGap: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
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
    contentRow: {
        rowGap: 6,
        paddingTop: 0,
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
        rowGap: 24,
    },
    cardFooter: {
        padding: 0,
    },
    footerTextXL: {
        fontSize: 32,
        textAlign: 'right',
        fontWeight: '600',
    },
})