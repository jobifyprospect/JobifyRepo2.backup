import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {styles} from '../../styles/Globals';
import Colors from '../../styles/Colors';
import {Job} from '../../services/interfaces/job';
import {
  getCurrentUserUID,
  getIdByRoleId,
  getUser,
} from '../../services/firestore/users';
import {FIRESTORE_TIMESTAMP} from '../../config/firebase';
import {getUserDetailsByClientId} from '../../services/firestore/users';
import {
  createApplication,
  hasWorkerApplied,
} from '../../services/firestore/applications';
import {getJob} from '../../services/firestore/jobs';
import {
  NavigationProp,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import DynamicButton from '../../components/DynamicButton';
import BackButton from '../../components/BackButton';
import {User} from '../../services/interfaces/user';
import {Application} from '../../services/interfaces/application';
import uuid from 'react-native-uuid';
import {showAlert} from '../../components/AlertDialog';
import {RootStackParamList} from '../interfaces/RouterStackInterfaceParams';
import CounterOfferModal from '../../components/Modal';

interface RouterProps {
  navigation: NavigationProp<any, any>;
  route: RouteProp<RootStackParamList, 'ApplyToJob'>;
}

export default function ApplyToJob({navigation, route}: RouterProps) {
  const [job, setJob] = useState<Job>();
  const [loading, setIsLoading] = useState<boolean>(false);
  const [client, setClient] = useState<User>();
  const [hasApplied, setHasApplied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false); // State to track refreshing
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<any>(null);
  const job_id = route.params.id;

  // Fetch the current user UID only once when the component mounts
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
      };

      await createApplication(newApplication);
      showAlert('Success', 'Your profile has been sent to the client.');
      onRefresh();
    } catch (e) {
      showAlert('Error', 'Oops, something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }
  async function handleSubmitApplicationWithOffer(
    newOffer: number | undefined,
  ) {
    if (newOffer === undefined || newOffer === null) {
      setIsModalVisible(false);
      return;
    }

    try {
      setIsSubmitting(true);

      const newApplication: Application = {
        applicationId: uuid.v4().toString(), // Ensure uuid is properly imported
        offer: Number(newOffer), // Keep this if you're receiving 'newOffer' as a string, otherwise you can remove the Number()
        status: 'pending',
        jobId: job?.jobId as string, // Ensure 'job' and 'jobId' exist
        workerId: currentUserId, // Make sure currentUserId is defined
        createdAt: FIRESTORE_TIMESTAMP, // Type this appropriately
        updatedAt: FIRESTORE_TIMESTAMP, // Type this appropriately
      };

      await createApplication(newApplication);
      showAlert('Success', 'Your profile has been sent to the client.');
      onRefresh(); // Ensure onRefresh is defined
    } catch (e) {
      showAlert('Error', 'Oops, something went wrong.');
    } finally {
      setIsSubmitting(false);
      setIsModalVisible(false);
    }
  }

  const fetchJob = useCallback(
    async (currentUserIdProp: string) => {
      while (!currentUserIdProp) {
        return;
      }

      try {
        if (job_id) {
          const jobs = await getJob(job_id);

          if (jobs) {
            const clientte = await getUserDetailsByClientId(
              jobs?.clientId as string,
            );

            clientte && setClient(clientte);
            const appliedStatus = await hasWorkerApplied({
              jobId: job_id,
              workerId: currentUserIdProp,
            });
            if (appliedStatus) {
              appliedStatus && setHasApplied(appliedStatus);
            }
          }
          jobs && setJob(jobs);
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setIsLoading(false);
        setRefreshing(false); // Stop the refreshing spinner
      }
    },
    [job_id],
  );
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
    fetchJob(currentUserId); // Refresh the job data
  }, [currentUserId, fetchJob]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      if (currentUserId !== null) {
        fetchJob(currentUserId);
      }
    }, [currentUserId, fetchJob]),
  );

  const initials = `${client?.firstName}${client?.lastName}`.toUpperCase();

  if (loading && !refreshing) {
    return (
      <View style={localStyles.contentLoading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.mediumText}> Loading Details.. </Text>
      </View>
    );
  }

  return (
    <>
      <View style={localStyles.container}>
        <View style={localStyles.btnContainerStart}>
          <BackButton onPress={async () => navigation.goBack()} />
        </View>

        <View style={localStyles.screen}>
          <Text style={styles.largeHeading}>{job?.title}</Text>

          <ScrollView>
            <View style={localStyles.sectionContainer}>
              <View style={localStyles.card}>
                <View style={localStyles.cardContent}>
                  <View style={localStyles.contentRow}>
                    <View style={localStyles.contentItemRow}>
                      <View style={localStyles.profileContainer}>
                        {client?.profilePicture ? (
                          <Image
                            source={{uri: client?.profilePicture}}
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
                      <Text style={localStyles.nameContainer}>
                        {client?.firstName} {client?.lastName}
                      </Text>
                    </View>
                  </View>

                  <View style={localStyles.contentRow}>
                    <Text style={localStyles.cardContentHeader}>
                      Contact Info
                    </Text>
                    <View>
                      <Text style={localStyles.contentTextRegular}>
                        Email: {client?.email}
                      </Text>
                      <Text style={localStyles.contentTextRegular}>
                        Phone: {client?.phoneNumber}
                      </Text>
                    </View>
                  </View>

                  <View style={localStyles.contentRow}>
                    <Text style={localStyles.cardContentHeader}>
                      Full Job Address{' '}
                    </Text>
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
                    <Text style={localStyles.cardContentHeader}>Schedule </Text>
                    <Text style={localStyles.contentTextRegular}>
                      {job?.schedule}
                    </Text>
                  </View>

                  <View style={localStyles.contentRow}>
                    <Text style={localStyles.cardContentHeader}>
                      Job Description
                    </Text>
                    <View>
                      <Text style={localStyles.contentTextRegular}>
                        {job?.description}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={localStyles.cardFooter}>
                  <Text style={localStyles.cardContentHeader}>Rate / hr </Text>
                  <Text style={localStyles.footerTextXL}>
                    PHP {job?.pay}.00
                  </Text>
                </View>
                <View style={localStyles.actionBtnGroup}>
                  {hasApplied ? (
                    <DynamicButton
                      disabled
                      type="primary"
                      onPress={() => undefined}
                      title="You have already applied to this listing."
                    />
                  ) : (
                    <>
                      <DynamicButton
                        type="primary"
                        onPress={() => handleSubmitApplication()}
                        title="Apply"
                        disabled={isSubmitting}
                      />
                      <DynamicButton
                        type="secondary"
                        onPress={() => setIsModalVisible(true)}
                        title="Counter Offer"
                        disabled={isSubmitting}
                      />
                    </>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
      <CounterOfferModal
        isVisible={isModalVisible}
        onClose={value => handleSubmitApplicationWithOffer(value)}
      />
    </>
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
  nameContainer: {fontWeight: '600', fontSize: 24},
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
  btnContainerStart: {
    alignItems: 'flex-start',
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
    marginBottom: 60,
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
  contentItemRow: {flexDirection: 'row', alignItems: 'center'},
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
