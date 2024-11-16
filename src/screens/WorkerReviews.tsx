/* eslint-disable react-native/no-inline-styles */
import {NavigationProp, Route} from '@react-navigation/native';
import BackButton from '../components/BackButton';

import React, {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import {styles} from '../styles/Globals';
import Colors from '../styles/Colors';
import {useCallback, useEffect, useState} from 'react';
import {getUserDetailsByWorkerId} from '../services/firestore/users';
import {User} from '../services/interfaces/user';
import {applicationsRef} from '../config/firebase';
import {Review} from '../services/interfaces/review';
import {getReviewsByAppId} from '../services/firestore/reviews';
import {getJobs} from '../services/firestore/jobs';
import {Job} from '../services/interfaces/job';
import {formatDateToReadable} from '../utils/Utils';

interface RouterProps {
  navigation: NavigationProp<any, any>;
  route: Route<string, {worker_id: string}>;
}

export default function WorkerReviews({navigation, route}: RouterProps) {
  const params_workerId = route.params.worker_id;

  const [worker, setWorker] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [appIds, setAppIds] = useState<string[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [jobIds, setJobIds] = useState<string[]>([]);

  const [appJobs, setAppJobs] = useState<Job[]>([]);

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

  const fetchWorkerReviews = useCallback(async (ids: string[]) => {
    if (!ids) {
      console.error('no ids passed');
      return;
    }

    try {
      const workerReviews = await getReviewsByAppId(ids);
      workerReviews && setReviews(workerReviews);
    } catch (error) {
      console.error('Failed to fetch worker reviews:', error);
    }
  }, []);

  const fetchAppJobs = useCallback(async (ids: string[]) => {
    if (!ids) {
      console.error('no ids passed');
      return;
    }

    try {
      const appJobsA = await getJobs(ids);
      appJobsA && setAppJobs(appJobsA);
    } catch (error) {
      console.error('Failed to application jobs:', error);
    }
  }, []);

  useEffect(() => {
    fetchWorkerDetails();

    if (appIds.length !== 0) {
      fetchWorkerReviews(appIds);
    }

    if (jobIds.length !== 0) {
      fetchAppJobs(jobIds);
    }
    // fetchAppJobs(jobIds);
  }, [
    fetchWorkerDetails,
    fetchWorkerReviews,
    applications,
    appIds,
    jobIds,
    fetchAppJobs,
  ]);

  //fetch application ids here.
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

            const applicationsA = snapshot.docs;

            if (applicationsA) {
              const jobIdsA = applicationsA.map(
                application => application.data().jobId,
              );
              const appIdsA = applicationsA.map(
                application => application.data().applicationId,
              );
              const apps = applicationsA.map(application => ({
                appId: application.data().applicationId,
                jobId: application.data().jobId,
                offer: application.data().offer,
                status: application.data().status,
              }));
              setJobIds(jobIdsA);
              setAppIds(appIdsA);
              setApplications(apps);
            }
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

  console.log('apps', applications);
  console.log('appIds', appIds);

  const initials = `${worker?.firstName ?? ''}${
    worker?.lastName ?? ''
  }`.toUpperCase();

  return (
    <View style={localStyles.container}>
      <SafeAreaView style={localStyles.btnContainerBetween}>
        <BackButton onPress={async () => navigation.goBack()} />
      </SafeAreaView>

      <View style={localStyles.screen}>
        <Text style={styles.largeHeading}> Worker Reviews </Text>
        <ScrollView>
          {applications.map(application => (
            <>
              {appJobs.map(appJob => (
                <>
                  {reviews?.map(review => {
                    if (appJob.jobId === application.jobId) {
                      return (
                        <>
                          {/* header */}
                          <View style={localStyles.reviewContainer}>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}>
                                <View style={localStyles.profileContainer}>
                                  {worker?.profilePicture ? (
                                    <Image
                                      source={{uri: worker?.profilePicture}}
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
                                <View
                                  style={{
                                    flex: 0.99,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                  }}>
                                  <Text style={styles.boldText}>
                                    {' '}
                                    {worker?.firstName} {worker?.lastName}{' '}
                                  </Text>
                                  <Text>
                                    {' '}
                                    {formatDateToReadable(
                                      appJob.updatedAt,
                                    )}{' '}
                                  </Text>
                                </View>
                              </View>
                            </View>

                            <View
                              style={{
                                height: 1,
                                marginVertical: 8,
                                marginHorizontal: 12,
                                backgroundColor: Colors.black,
                              }}>
                              {' '}
                              <Text> - </Text>{' '}
                            </View>

                            {/* body */}
                            <View style={{padding: 10, rowGap: 12}}>
                              <View style={localStyles.cardHeader}>
                                <Text style={styles.mediumText}>
                                  {' '}
                                  {appJob.title}{' '}
                                </Text>
                                <Text style={styles.mediumText}>
                                  {' '}
                                  PHP {application.offer}{' '}
                                </Text>
                              </View>
                              <View style={{rowGap: 5}}>
                                <Text style={styles.regularText}>
                                  {' '}
                                  {review.comment}{' '}
                                </Text>
                                {/* TODO: svg not showing */}
                                {/* <Image style={localStyles.profileImage} source={{ uri: '../assets/star2.svg' }} /> */}
                                <Text style={styles.bold}>
                                  {' '}
                                  {review.rating} / 5 Stars{' '}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </>
                      );
                    }
                  })}
                </>
              ))}
            </>
          ))}
        </ScrollView>
      </View>
    </View>
  );
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
    padding: 12,
    borderColor: Colors.placeholder,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});
