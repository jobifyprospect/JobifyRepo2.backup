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
import { getUserDetailsByWorkerId } from '../../services/firestore/users';
import { getJob, updateJobAssignedWorker } from '../../services/firestore/jobs';
import { Job } from '../../services/interfaces/job';
import { styles } from '../../styles/Globals';
import { getAddress } from '../../services/firestore/addresses';
import { Address } from '../../services/interfaces/address';
import { updateApplication } from '../../services/firestore/applications';
import { Application } from '../../services/interfaces/application';
import DynamicButton from '../../components/DynamicButton';
import { applicationsRef, FIRESTORE_TIMESTAMP } from '../../config/firebase';
import TextButton from '../../components/TextButton';
import { formatCurrency } from '../../utils/Utils';

import { getTimeRecordsByApplications, getAllTimeRecords } from '../../services/firestore/time_records'

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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [job, setJob] = useState<Job | null>(null);
  const [loadingWorker, setLoadingWorker] = useState<boolean>(true);
  const [loadingJob, setLoadingJob] = useState<boolean>(true);
  const [loadingAddress, setLoadingAddress] = useState<boolean>(true);

  const [clockedIn, setClockedIn] = useState();

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
            <View>
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

          <View>
            <Text style={styles.mediumText}> History </Text>
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
          </View>

          <View>
            <Text style={styles.mediumText}> Time in request </Text>
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
  nameContainer: { fontWeight: '600', fontSize: 24 },
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
