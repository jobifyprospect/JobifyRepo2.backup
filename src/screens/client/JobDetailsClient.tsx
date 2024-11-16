import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {styles} from '../../styles/Globals';
import Colors from '../../styles/Colors';
import {Job} from '../../services/interfaces/job';
import {getJob} from '../../services/firestore/jobs';
import {NavigationProp, Route, useFocusEffect} from '@react-navigation/native';
import RefreshButton from '../../components/RefreshComponent';
import DynamicButton from '../../components/DynamicButton';
import BackButton from '../../components/BackButton';
import {formatDateToReadable} from '../../utils/Utils';
import {getApplicationsByJobId} from '../../services/firestore/applications';
import {Application} from '../../services/interfaces/application';
import {applicationsRef} from '../../config/firebase';
import {getCurrentUserUID, getUser} from '../../services/firestore/users';
import {deleteJob} from '../../services/firestore/jobs';
import {showAlert} from '../../components/AlertDialog';
import WorkerItem from '../../components/GetWorkerFullName';

interface RouterProps {
  navigation: NavigationProp<any, any>;
  route: Route<string, {id: string}>;
}

export default function JobDetailsClient({navigation, route}: RouterProps) {
  const id = route.params.id;

  const [job, setJob] = useState<Job>();
  const [applicants, setApplicants] = useState<Application[]>();
  const [loading, setIsLoading] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<'Listing' | 'Applicants'>(
    'Listing',
  );
  const [currentUserId, setCurrentUserId] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false); // State to track refreshing
  const [deleting, setDeleting] = useState(false); // State to track refreshing

  async function fetchMyRoleId() {
    try {
      const uid = await getCurrentUserUID();
      if (uid) {
        const currentRole = await getUser(uid);
        setCurrentUserId(currentRole?.defaultRole);
      }
    } catch (err) {
      console.error('something went wrong while fetching user');
    }
  }

  const fetchJobAndApplicants = useCallback(async () => {
    setIsLoading(true); // Set loading to true at the start
    try {
      if (id) {
        // Fetch job and applicants simultaneously
        const [jobData, applicantsData] = await Promise.all([
          getJob(id),
          getApplicationsByJobId(id),
        ]);

        // Update states with fetched data
        jobData && setJob(jobData);
        applicantsData && setApplicants(applicantsData);
      }
    } catch (error) {
      console.error('Error fetching job or applicants:', error);
    } finally {
      setIsLoading(false); // Set loading to false after both fetches are completed
      setRefreshing(false); // Stop refreshing if applicable
    }
  }, [id]);

  function handleDeleteJob(iid: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!iid) {
        showAlert('error', 'No job found.');
        return reject(new Error('No job ID provided'));
      }
      setDeleting(true);

      try {
        await deleteJob(iid);
        resolve();
      } catch (error) {
        console.error(error);
        reject(error);
      } finally {
        setDeleting(false);
        navigation.goBack();
      }
    });
  }
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

  useEffect(() => {
    fetchJobAndApplicants(); // Initial fetch when the component mounts
  }, [fetchJobAndApplicants]);

  useFocusEffect(
    useCallback(() => {
      if (currentUserId === null) {
        fetchMyRoleId();
      }
    }, [currentUserId]),
  );

  useEffect(() => {
    if (job?.jobId) {
      const unsubscribe = applicationsRef
        .where('jobId', '==', job.jobId)
        .onSnapshot(
          snapshot => {
            const applicationData = snapshot.docs.map(doc =>
              doc.data(),
            ) as Application[];
            setApplicants(applicationData);
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

        {currentScreen === 'Listing' && (
          <DynamicButton onPress={() => undefined} title="Edit" />
        )}

        {currentScreen === 'Applicants' && (
          <RefreshButton
            type="primary"
            onPress={() => onRefresh()}
            disabled={refreshing} // Disable button when refreshing
          />
        )}
      </SafeAreaView>

      <View>
        <Text style={localStyles.pageHeader}>{job?.title}</Text>
        <View style={localStyles.containTab}>
          <Pressable
            style={[
              styles.w100,
              localStyles.tabStyle,
              currentScreen === 'Listing'
                ? {}
                : {backgroundColor: Colors.placeholder},
            ]}
            onPress={() => setCurrentScreen('Listing')}>
            <Text style={localStyles.centerText}>Job Listing</Text>
          </Pressable>

          <Pressable
            style={[
              styles.w100,
              localStyles.tabStyle,
              currentScreen === 'Applicants'
                ? {}
                : {backgroundColor: Colors.placeholder},
            ]}
            onPress={() => setCurrentScreen('Applicants')}>
            <Text style={localStyles.centerText}>Applicants</Text>
          </Pressable>
        </View>
      </View>

      <>
        {currentScreen === 'Listing' ? (
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
                    PHP {job?.pay}.00
                  </Text>
                  <DynamicButton
                    type="destructive"
                    onPress={() => {
                      showAlert(
                        'Delete Job Entry?',
                        'You are about to delete a job entry. Tap anywhere to cancel',
                        () => {
                          handleDeleteJob(job?.jobId as string);
                        },
                      );
                    }}
                    title="Delete"
                    disabled={deleting}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        ) : (
          <View>
            {!applicants || refreshing ? (
              <View style={localStyles.refreshIndicator}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.mediumText}> Loading Details.. </Text>
              </View>
            ) : (
              <FlatList
                style={localStyles.flatList} // Style for the FlatList
                removeClippedSubviews={false}
                ListEmptyComponent={
                  <Text style={[styles.card, styles.gap]}>
                    No applications for this listing yet.
                  </Text>
                }
                data={applicants} // Display searchResults instead of myListings
                renderItem={({item, index}) => {
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
                        onPress={() => {
                          navigation.navigate('AcceptOrDeclineApplicant', {
                            worker_id: item.workerId,
                            job_id: job?.jobId,
                            app_id: item.applicationId,
                            app_status: item.status,
                            offer: item.offer,
                          });
                        }}
                        key={item.jobId}
                        style={[localStyles.jobCard, getCardStyle()]}>
                        <View style={localStyles.containItems}>
                          <View style={localStyles.column}>
                            <WorkerItem workerId={item.workerId} />

                            <View style={localStyles.row}>
                              <Text style={[styles.smallText]}>
                                {job?.title}
                              </Text>
                              <Text style={styles.smallText}> - </Text>
                              <Text style={[styles.smallText]}>
                                PHP {job?.pay}
                              </Text>
                            </View>
                          </View>

                          <View style={localStyles.containText}>
                            <Text style={[styles.mediumText]}>Offer</Text>
                            <Text style={[styles.mediumTextBlue]}>
                              PHP {item.offer ? item.offer : null}
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    </>
                  );
                }}
              />
            )}
          </View>
        )}
      </>
    </View>
  );
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
  centerText: {textAlign: 'center'},
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
  row: {flexDirection: 'row'},
  column: {flexDirection: 'column'},
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
