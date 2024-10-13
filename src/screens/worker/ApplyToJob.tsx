import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { styles } from '../../styles/Globals';
import Colors from '../../styles/Colors';
import { Job } from '../../services/interfaces/job';
import { getUser } from '../../services/firestore/users';
import { FIRESTORE_TIMESTAMP, getCurrentUserUID } from '../../config/firebase';
import { getUserDetailsByClientId } from '../../services/firestore/users';
import { createApplication, getApplicationsByWorkerId, hasWorkerApplied } from '../../services/firestore/applications';
import { getJob } from '../../services/firestore/jobs';
import { NavigationProp, Route, RouteProp, useFocusEffect } from '@react-navigation/native';
import DynamicButton from '../../components/DynamicButton';
import BackButton from '../../components/BackButton';
import { User } from '../../services/interfaces/user';
import { Application } from '../../services/interfaces/application';
import uuid from 'react-native-uuid';
import { showAlert } from '../../components/AlertDialog';
import { RootStackParamList } from '../interfaces/RouterStackInterfaceParams';

interface RouterProps {
    navigation: NavigationProp<any, any>;
    route: RouteProp<RootStackParamList, 'ApplyToJob'>
}

export default function ApplyToJob({ navigation, route }: RouterProps) {
    const [job, setJob] = useState<Job>();
    const [loading, setIsLoading] = useState<boolean>(false)
    const [client, setClient] = useState<User>()
    const [hasApplied, setHasApplied] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [currentUserId, setCurrentUserId] = useState<any>(null)
    const [refreshing, setRefreshing] = useState(false); // State to track refreshing

    const job_id = route.params.id

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

    async function handleSubmitApplication() {
        try {
            setIsSubmitting(true);

            const newApplication: Application = {
                applicationId: uuid.v4().toString(),
                offer: Number(job?.pay),
                status: 'pending',
                jobId: job?.jobId as string,
                workerId: currentUserId,
                createdAt: FIRESTORE_TIMESTAMP,
                updatedAt: FIRESTORE_TIMESTAMP,
            }

            await createApplication(newApplication);
            showAlert("Success", "Your profile has been sent to the client.")
            onRefresh()
        } catch (e) {
            showAlert("Error", "Oops, something went wrong.")
        } finally {
            setIsSubmitting(false);
        }
    }

    const fetchJob = useCallback(async (currentUserIdProp: string) => {
        while (!currentUserIdProp) { return }

        try {
            if (job_id) {
                const jobs = await getJob(job_id);

                if (jobs) {
                    const client = await getUserDetailsByClientId(jobs?.clientId as string);

                    client && setClient(client);
                    const appliedStatus = await hasWorkerApplied({ jobId: job_id, workerId: currentUserIdProp })
                    if (appliedStatus) {
                        appliedStatus && setHasApplied(appliedStatus)
                    }
                }
                jobs && setJob(jobs);
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setIsLoading(false)
            setRefreshing(false); // Stop the refreshing spinner
        }
    }, [currentUserId]);

    const onRefresh = useCallback(() => {
        setRefreshing(true); // Start the refreshing spinner
        fetchJob(currentUserId); // Refresh the job data
    }, [fetchJob]);

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true)
            if (currentUserId === null) {
                fetchMyRoleId()
            }
            if (currentUserId !== null) {
                fetchJob(currentUserId);
            }
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
    const initials = `${client?.firstName}${client?.lastName}`.toUpperCase();

    if (loading)
        return (
            <View style={{ flex: 1, rowGap: 14, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator
                    size="large"
                    color={Colors.primary}
                />
                <Text style={styles.mediumText}> Loading Job.. </Text>
            </View>
        )

    return (
        <View style={localStyles.container}>
            <View style={localStyles.btnContainerStart}>
                <BackButton onPress={async () => navigation.goBack()} />
            </View>

            <View style={localStyles.screen}>
                <Text style={styles.largeHeading}> {job?.title} </Text>

                <ScrollView>
                    <View style={localStyles.sectionContainer}>
                        <View style={localStyles.card}>
                            <View style={localStyles.cardContent}>

                                <View style={localStyles.contentRow}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={localStyles.profileContainer}>
                                            {client?.profilePicture ? (
                                                <Image
                                                    source={{ uri: client?.profilePicture }}
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
                                        <Text style={{ fontWeight: '600', fontSize: 24 }}> {client?.firstName} {client?.lastName} </Text>
                                    </View>
                                </View>

                                <View style={localStyles.contentRow}>
                                    <Text style={localStyles.cardContentHeader}> Contact Info </Text>
                                    <View>
                                        {/*TODO:  uncomment when email is implemented */}
                                        {/* <Text style={localStyles.contentTextRegular}> Email: {client?.email}  </Text> */}
                                        <Text style={localStyles.contentTextRegular}> Phone: {client?.phoneNumber}  </Text>
                                    </View>
                                </View>

                                <View style={localStyles.contentRow}>
                                    <Text style={localStyles.cardContentHeader}> Address </Text>
                                    <Text style={localStyles.contentTextRegular}> {job?.location}  </Text>
                                </View>

                                <View style={localStyles.contentRow}>
                                    <Text style={localStyles.cardContentHeader}> Schedule </Text>
                                    <Text style={localStyles.contentTextRegular}> {job?.schedule}  </Text>
                                </View>

                                <View style={localStyles.contentRow}>
                                    <Text style={localStyles.cardContentHeader}> Job Description </Text>
                                    <View>
                                        {/*TODO:  uncomment when email is implemented */}
                                        {/* <Text style={localStyles.contentTextRegular}> Email: {client?.email}  </Text> */}
                                        <Text style={localStyles.contentTextRegular}> {job?.description}  </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={localStyles.cardFooter}>
                                <Text style={localStyles.cardContentHeader}> Rate / hr </Text>
                                <Text style={localStyles.footerTextXL}> PHP {job?.pay}.00  </Text>
                            </View>

                            {
                                hasApplied ?
                                    <DynamicButton disabled type='primary' onPress={() => undefined} title='You have already applied to this listing.' />
                                    :
                                    <>
                                        <DynamicButton type='primary' onPress={() => handleSubmitApplication()} title='Apply' />
                                        <DynamicButton type='secondary' onPress={() => undefined} title='Counter Offer' />
                                    </>
                            }
                        </View>
                    </View>
                </ScrollView>
            </View>


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
    btnContainerStart: {
        alignItems: 'flex-start',
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
        padding: 24,
        rowGap: 12,
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
        color: Colors.black,
        fontSize: 16,
        fontWeight: "400",
    },
    contentTextRegular: {
        fontSize: 14,
        fontWeight: '300',
    },
    cardContent: {
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
        padding: 0,
    },
    footerTextXL: {
        fontSize: 32,
        textAlign: 'right',
        fontWeight: '600',
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
        backgroundColor: Colors.primaryWithOpacity10,
        borderRadius: 100,
    },
    avatarPlaceholder: {
        height: 52,
        textAlign: 'center',
        textAlignVertical: 'center',
        color: Colors.primary,
        fontSize: 18,
    },
    statusText: {
        marginLeft: 'auto',
    },
    flatList: {
        marginBottom: 100,
    },
});
