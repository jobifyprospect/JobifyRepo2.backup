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
import BackButton from '../../components/BackButton';
import Colors from '../../styles/Colors';
import { NavigationProp, Route } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { User } from '../../services/interfaces/user';
import { getCurrentUserUID, getIdByRoleId, getUser, getUserDetailsByWorkerId } from '../../services/firestore/users';
import { getJob } from '../../services/firestore/jobs';
import { Job } from '../../services/interfaces/job';
import { styles } from '../../styles/Globals';
import { getAddress } from '../../services/firestore/addresses';
import { Address } from '../../services/interfaces/address';
import { Application } from '../../services/interfaces/application';
import DynamicButton from '../../components/DynamicButton';
import { FIRESTORE_TIMESTAMP, timeRecordsRef } from '../../config/firebase';
import TextButton from '../../components/TextButton';
import { formatDate } from '../../utils/Utils';
import uuid from 'react-native-uuid';
import { getTimeRecord, updateRecord } from '../../services/firestore/time_records'
import { TimeRecord } from '../../services/interfaces/time_records';
import { Notification } from '../../services/interfaces/notification';
import { createNotification } from '../../services/firestore/notifications';
import { getApplication } from '../../services/firestore/applications';

interface RouterProps {
  navigation: NavigationProp<any, any>;
  route: Route<string, { worker_id: string; job_id: string; app_id: string }>;
}

export default function ManageWorker({
  navigation,
  route,
}: RouterProps) {
  const params_workerId = route.params.worker_id;
  const params_jobId = route.params.job_id;
  const params_appId = route.params.app_id;

  const [worker, setWorker] = useState<User | null>(null);
  const [workerAddress, setWorkerAddress] = useState<Address | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loadingWorker, setLoadingWorker] = useState<boolean>(true);
  const [loadingJob, setLoadingJob] = useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = useState<any>(null);
  const [loadingAddress, setLoadingAddress] = useState<boolean>(true);

  const [workerTimeRecord, setWorkerTimeRecord] = useState<TimeRecord>();

  async function getWorkerTimeRecords() {
    const res = await getTimeRecord(params_jobId, params_workerId)
    if (res) {
      setWorkerTimeRecord(res)
    }
  }

  async function approveWorkerTimeLogs() {

    const receiverDetails = await getUserDetailsByWorkerId(application?.workerId as string);
    const receiverId = receiverDetails?.userId as string;

    // Create and send notification
    const notificationData: Notification = {
      id: uuid.v4().toString(), // Generate a unique notification ID
      title: 'Timelogs Approved.',
      subtitle: `Your timelogs have been approved for ${job?.title}`,
      senderId: currentUserId,
      receiverId: receiverId,
      isRead: false,
      createdAt: FIRESTORE_TIMESTAMP,
      updatedAt: FIRESTORE_TIMESTAMP,
      params: {
        component: 'JobDetailsWorker',
        id1: job?.jobId
      }
    };

    await createNotification(notificationData);
    const payload: Partial<TimeRecord> = {
      acceptedBy: currentUserId
    }

    const res = await updateRecord(payload, workerTimeRecord?.id)
  }

  useEffect(() => {
    getWorkerTimeRecords()
  }, [])
  // Fetch worker details
  const fetchWorkerDetails = useCallback(async () => {
    setLoadingWorker(true);
    try {
      if (params_workerId) {
        const workerDetails = await getUserDetailsByWorkerId(params_workerId);
        workerDetails && setWorker(workerDetails);
      }
    } catch (error) {
      console.error('Failed to fetch worker details:', error);
    } finally {
      setLoadingWorker(false);
    }
  }, [params_workerId]);

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
      }
    };

    async function fetchApplicationDetails() {
      const res = await getApplication(params_appId)
      setApplication(res)
    }

    fetchApplicationDetails()
    fetchCurrentUserId();
  }, []);

  // Fetch job details
  const fetchJob = useCallback(async () => {
    setLoadingJob(true);
    try {
      if (params_jobId) {
        const jobs = await getJob(params_jobId);
        jobs && setJob(jobs);
      }
    } catch (error) {
      console.error('Failed to fetch job:', error);
    } finally {
      setLoadingJob(false);
    }
  }, [params_jobId]);

  // Fetch address details after worker details are fetched
  const fetchAddress = useCallback(async () => {
    if (!worker) {
      return;
    }
    setLoadingAddress(true);
    try {
      if (worker.addressId) {
        const address = await getAddress(worker.addressId);
        address && setWorkerAddress(address);
      }
    } catch (error) {
      console.error('Failed to fetch address:', error);
    } finally {
      setLoadingAddress(false);
    }
  }, [worker]);

  // Fetch worker and job details on component mount
  useEffect(() => {
    fetchJob();
    fetchWorkerDetails();
  }, [fetchJob, fetchWorkerDetails]);

  // Fetch address once worker is fetched
  useEffect(() => {
    fetchAddress();
  }, [fetchAddress, worker]);

  useEffect(() => {
    if (!params_jobId) {
      console.error('params_jobId is undefined or null');
      return;
    }

    try {
      const unsubscribe = timeRecordsRef
        .where('jobId', '==', params_jobId)
        .where('workerId', '==', params_workerId)
        .onSnapshot(
          snapshot => {
            if (snapshot.empty) {
              return;
            }

            const timeRecordsData = snapshot.docs[0]?.data() as TimeRecord;

            setWorkerTimeRecord(timeRecordsData);
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

  // Check if any data is still loading
  if (loadingWorker || loadingJob || loadingAddress) {
    return (
      <View style={localStyles.contentLoading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.mediumText}>Loading Details...</Text>
      </View>
    );
  }

  return (
    <View style={localStyles.container}>
      <SafeAreaView style={localStyles.btnContainerBetween}>
        <BackButton onPress={async () => navigation.goBack()} />
      </SafeAreaView>

      <View style={localStyles.screen}>
        <Text style={styles.largeHeading}> Manage Worker </Text>
        <ScrollView>

          <Pressable
            onPress={async () =>
              navigation.navigate('WorkerReviews', {
                worker_id: params_workerId,
                app_id: application?.applicationId,
              })
            }
            style={localStyles.card}>
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
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={localStyles.nameContainer}>
                {worker?.firstName} {worker?.lastName}
              </Text>
              <TextButton
                title="View Reviews"
                onPress={async () =>
                  navigation.navigate('WorkerReviews', {
                    worker_id: params_workerId,
                    app_id: application?.applicationId,
                  })
                }
              />
            </View>
          </Pressable>

          <View style={{ rowGap: 12 }}>
            <Text style={styles.mediumTextBlue}> History </Text>
            <View style={{ rowGap: 4 }}>
              <View style={{ backgroundColor: 'white', height: 36, alignItems: 'center', justifyContent: 'center' }}>
                {workerTimeRecord?.time_in ? <Text style={styles.boldText}> Time in: {formatDate(workerTimeRecord?.time_in)} </Text> : <Text> No time logs yet. </Text>}
              </View>

              <View style={{ backgroundColor: 'white', height: 36, alignItems: 'center', justifyContent: 'center' }}>
                {workerTimeRecord?.time_out ? <Text style={styles.boldText}> Time out: {formatDate(workerTimeRecord?.time_out)} </Text> : <Text> No time out request yet. </Text>}
              </View>
            </View>

            <Text style={styles.mediumTextBlue}> Actions </Text>
            <View style={{ rowGap: 4 }}>
              {workerTimeRecord?.acceptedBy ?
                <Text style={styles.boldText}> You have already approved this worker's time logs. </Text>
                :
                <DynamicButton disabled={workerTimeRecord?.time_in && workerTimeRecord.time_out ? false : true} title="Approve worker time logs" onPress={async () => approveWorkerTimeLogs()} />
              }
            </View>
          </View>

          {/* <View>
            <Text style={styles.mediumText}> Time out request </Text>
            <View style={{ backgroundColor: 'white', flex: 1 }}>
              <View style={{ flex: 1, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, alignItems: 'center' }}>
                <View>
                  <Text style={styles.mediumText}> 12:23 PM  </Text>
                </View>
                <View>
                  <DynamicButton type='secondary' title='Accept' onPress={() => undefined} />
                  <DynamicButton type='destructive' title='X' onPress={() => undefined} />
                </View>
              </View>
            </View>
          </View> */}
        </ScrollView>
      </View>
    </View>
  );
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
  nameContainer: { fontWeight: '600', fontSize: 22, flex: 1, textAlign: 'left', justifyContent: 'center', paddingVertical: 10 },
  screen: {
    flex: 1,
    paddingTop: 24,
    rowGap: 24,
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
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 99,
    padding: 24,
    rowGap: 12,
    marginBottom: 40,
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
  contentLoading: {
    flex: 1,
    rowGap: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
  contentRow: {
    rowGap: 6,
    paddingTop: 0,
    paddingBottom: 16,
    borderColor: Colors.placeholder,
    borderBottomWidth: 1,
    borderBottomColor: Colors.placeholder,
  },
  contentItemRow: {
    borderWidth: 0.5,
    borderColor: Colors.placeholder,
    padding: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
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
});
