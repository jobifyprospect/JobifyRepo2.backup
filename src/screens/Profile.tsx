import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Modal,
  Dimensions
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { styles } from '../styles/Globals';
import {
  FIREBASE_AUTH,
  // FIRESTORE_TIMESTAMP
} from '../config/firebase';
import {
  getCurrentUserUID,
  getIdByRoleId,
  getUser,
  getUserDefaultRole,
  getUserDefaultRoleUId,
  getUserDetails,
  removeFcmToken,
  updateUserRole,
} from '../services/firestore/users';
import { showAlert } from '../components/AlertDialog';
import Colors from '../styles/Colors';
import DynamicButton from '../components/DynamicButton';
import { User } from '../services/interfaces/user';
import { Address } from '../services/interfaces/address';
import { Validation } from '../services/interfaces/validation';
import { formatAddress } from '../utils/FormatAddress';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import TextButton from '../components/TextButton';
import { getClientDetails, getWorkerIdByRoleId } from '../services/firestore/roles';
import { calculateAverageRating, calculateAverageRating2 } from '../services/firestore/reviews';
import Svg, { Path } from 'react-native-svg';
import { removeIsNewUser } from '../shared/AuthUtils';
import Badge from '../components/Badge';
import { getWorker, getWorkerRealtime, updateWorker } from '../services/firestore/workers';
import { Worker } from '../services/interfaces/worker';
import BioInputDialog from '../components/BioInputDialog';
import { Client } from '../services/interfaces/client';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
// import {createNotification} from '../services/firestore/notifications';
// import uuid from 'react-native-uuid';
// import {useFCMToken} from '../config/FCMTokenContext';

library.add(faCheckCircle);
interface RouterProps {
  navigation: NavigationProp<any, any>;
}

type clientRatings = {
  averageRating: number,
  reviewCount: number,
  reviews: FirebaseFirestoreTypes.DocumentData[]
}

const Profile = ({ navigation }: RouterProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [validation, setValidation] = useState<Validation | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Track loading state
  const [userId, setUserId] = useState<string>(''); // Track loading state
  const [workerId, setWorkerId] = useState<string>(''); // Track loading state
  const [worker, setWorker] = useState<Worker | null>();
  const [isBioDialogVisible, setIsBioDialogVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<any>('');
  const [clientRatings, setClientRatings] = useState<clientRatings>({
    averageRating: 0,
    reviewCount: 0,
    reviews: []

  });

  // const fcmToken = useFCMToken();
  const [averageRating, setAverageRating] = useState(0);
  const [averageRatingClient, setAverageRatingClient] = useState(0);



  useEffect(() => {
    const fetchRating = async () => {
      const rating = await calculateAverageRating(workerId);
      setAverageRating(rating.averageRating);
    };

    fetchRating();
  }, [workerId]);

  //this essentially gets your current role id.
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
            setCurrentUserId(!clientIdByRole?.workerId ? clientIdByRole?.clientId : clientIdByRole?.workerId);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user ID:', error);
      }
    };

    fetchCurrentUserId();
  }, []);

  useEffect(() => {
    const fetchRating = async () => {
      const rating = await calculateAverageRating2(userId);
      setAverageRatingClient(rating.averageRating);
    };

    fetchRating();
  }, [userId]);


  useEffect(() => {
    async function fetchClientRatings(id: string) {
      const ratings = await calculateAverageRating2(id);
      setClientRatings(ratings);
    }

    if (currentUserId) {
      fetchClientRatings(currentUserId)
    }
  }, [currentUserId])

  const fetchUserProfile = useCallback(async () => {
    try {
      const uid = await getCurrentUserUID();
      const currentRole = await getUserDefaultRoleUId()


      if (uid) {
        const fetchedUserDetails = await getUserDetails(uid);
        setUserId(uid);
        if (fetchedUserDetails && fetchedUserDetails.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-shadow
          const { user, address, validation } = fetchedUserDetails[0];
          setUser(user);
          setAddress(address);
          setValidation(validation);
          if (currentRole === 'client') {

          }
          if (user?.defaultRole) {
            const fetchedWorkerId = await getWorkerIdByRoleId(user.defaultRole);
            setWorkerId(fetchedWorkerId || '');
          } else {
            console.warn('User default role is not defined.');
          }
        } else {
          console.error('No user details found.');
        }
      } else {
        console.error('No user ID found.');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false); // Set loading to false once data is fetched
    }
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupWorkerListener = async () => {
      if (workerId) {
        unsubscribe = getWorkerRealtime(workerId, (updatedWorker) => {
          if (updatedWorker) {
            setWorker(updatedWorker);
          }
        });
      }
    };

    setupWorkerListener();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [workerId]);

  // Use useFocusEffect to refetch user profile when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [fetchUserProfile]), // Empty dependency array ensures it runs when the screen is focused
  );

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleUpdateUser = useCallback(async () => {
    try {
      const uid: string | null = await getCurrentUserUID();
      if (uid) {
        await updateUserRole(uid, {}); // Update with necessary data if needed
        await removeIsNewUser();
      } else {
        showAlert('Error', 'No user ID found.');
      }
      showAlert(
        'Success',
        'User role changed successfully\nLogin your account again.',
      );
    } catch (error) {
      showAlert('Error', `Failed to Update: ${error}`);
    } finally {
      FIREBASE_AUTH.signOut();
    }
  }, []);


  const logOutUser = async () => {
    await removeFcmToken(userId); // Remove token on logout
    FIREBASE_AUTH.signOut();
  };
  return (
    <ScrollView style={localStyles.container}>
      <View style={localStyles.screen}>
        <SafeAreaView style={localStyles.btnContainerEnd}>
          <View style={localStyles.btnContainerEnd}>
            <DynamicButton
              title="Edit"
              type="primary"
              onPress={async () =>
                navigation.navigate('EditUserDetails', {
                  userId: user?.userId,
                  firstName: user?.firstName,
                  lastName: user?.lastName,
                  phoneNumber: user?.phoneNumber,
                  address: address,
                })
              }
            />
          </View>
        </SafeAreaView>
        <View style={localStyles.headerContainer}>
          <Text style={styles.largeHeading}>Profile</Text>

          {loading ? ( // Show loading indicator while fetching data
            <View style={localStyles.profileCard}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : user ? (
            <View style={localStyles.profileCard}>
              {/* Profile Picture and Name */}
              <View style={localStyles.profileRow}>
                {user.profilePicture ? (
                  <View>
                    <Image
                      source={{ uri: user.profilePicture }}
                      style={localStyles.profileImage}
                    />
                    {/* Show verification icon */}
                    {validation?.isAccountVerified ? (
                      <View style={localStyles.containIcon}>
                        <FontAwesomeIcon
                          icon="check-circle"
                          size={24}
                          color={Colors.primary} // Use primary color for verified badge
                          style={localStyles.verifiedIcon}
                        />
                      </View>
                    ) : null}
                  </View>
                ) : (
                  <View style={localStyles.initialsContainer}>
                    <Text style={localStyles.initialsText}>
                      {user.firstName?.charAt(0)}
                      {user.lastName?.charAt(0)}
                    </Text>
                    {/* Show verification icon */}
                    {validation?.isAccountVerified ? (
                      <View style={localStyles.containIcon}>
                        <FontAwesomeIcon
                          icon="check-circle"
                          size={24}
                          color={Colors.primary}
                          style={localStyles.verifiedIcon}
                        />
                      </View>
                    ) : null}
                  </View>
                )}

                <View style={localStyles.profileInfo}>

                  <View style={{ flexDirection: 'row', width: Dimensions.get('screen').width, alignItems: 'center', columnGap: 8 }}>
                    <Text style={localStyles.profileName}>
                      {user.firstName} {user.lastName}
                    </Text>

                    <Text style={[localStyles.modeText, styles.smallText]}>
                      {validation?.isAccountVerified === true
                        ? <Badge img='verified' />
                        : '(Not Verified)'}
                    </Text>
                  </View>
                  <View style={localStyles.containMode}>
                    <Text
                      style={[localStyles.modeText, styles.smallSemiBoldText]}>
                      {user?.defaultRole?.toString() ===
                        user?.roleId?.[0]?.toString()
                        ? 'Client Mode'
                        : 'Worker Mode'}
                    </Text>
                  </View>
                  {
                    !workerId ?
                      <View>
                        <View style={localStyles.gap} />
                        <View style={localStyles.starsContainer}>
                          {Array.from({ length: 5 }, (_, index) => {
                            const starValue = index + 1;
                            return (
                              <Svg
                                key={index}
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                fill={
                                  clientRatings.averageRating >= starValue
                                    ? Colors.primary
                                    : Colors.placeholder
                                }>
                                <Path d="M12 .587l3.668 7.429 8.2 1.193-5.934 5.787 1.401 8.172L12 18.896l-7.335 3.872 1.4-8.172-5.933-5.787 8.2-1.193L12 .587z" />
                              </Svg>
                            );
                          })}
                        </View>
                        <TextButton
                          title="View reviews"
                          onPress={async () =>
                            navigation.navigate('ViewClientProfile', {
                              clientId: currentUserId,
                            })
                          }
                        />
                      </View>
                      :
                      null
                  }
                </View>
              </View>
              <View style={localStyles.divider} />
              {/* Rating Details */}
              {workerId && (
                <View>
                  <View>
                    <Text style={styles.boldText}> Bio </Text>
                    <View style={localStyles.gap} />
                    {
                      worker?.bio ? (
                        <Text style={[styles.mediumRegularText, { color: Colors.labelText }]}>
                          {worker.bio}
                        </Text>
                      ) : (
                        <View>
                          <DynamicButton
                            title='Create a bio'
                            onPress={() => setIsBioDialogVisible(true)}
                          />
                        </View>
                      )
                    }

                    <BioInputDialog
                      isVisible={isBioDialogVisible}
                      onClose={() => setIsBioDialogVisible(false)}
                      onSave={async (newBio) => {
                        try {
                          await updateWorker(workerId, { bio: newBio });
                          // Update local state or refetch worker data
                          setIsBioDialogVisible(false);
                          // You might want to update the worker state here or refetch the data
                        } catch (error) {
                          console.error('Error updating bio:', error);
                          showAlert('Error', 'Failed to update bio. Please try again.');
                        }
                      }}
                    />
                  </View>
                  <View style={localStyles.divider} />
                  {worker ?
                    <View style={localStyles.badges}>
                      <Text style={styles.boldText}> Badges </Text>
                      <View style={localStyles.gap} />
                      <View style={localStyles.badgeContainer}>
                        {worker.badges && worker.badges.length > 0 ? (
                          worker.badges.map((badge) => (
                            <Badge key={badge} img={badge} />
                          ))
                        ) : (
                          <Text> Complete an assessment to earn badges. </Text>
                        )}
                      </View>
                    </View>
                    :
                    null}
                  <View style={localStyles.divider} />
                  <View>
                    <Text style={styles.boldText}>Ratings</Text>
                    <View style={localStyles.gap} />
                    <View style={styles.starsContainer}>
                      {Array.from({ length: 5 }, (_, index) => {
                        const starValue = index + 1;
                        return (
                          <Svg
                            key={index}
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill={
                              averageRating >= starValue
                                ? Colors.primary
                                : Colors.placeholder
                            }>
                            <Path d="M12 .587l3.668 7.429 8.2 1.193-5.934 5.787 1.401 8.172L12 18.896l-7.335 3.872 1.4-8.172-5.933-5.787 8.2-1.193L12 .587z" />
                          </Svg>
                        );
                      })}
                    </View>
                    <TextButton
                      title="View My Reviews"
                      onPress={async () =>
                        navigation.navigate('WorkerReviews', {
                          worker_id: workerId,
                        })
                      }
                    />
                    <View style={localStyles.divider} />
                  </View>
                </View>
              )}
              {/* Contact Details */}
              <View style={localStyles.contactDetails}>
                <Text style={styles.boldText}>Contact Info</Text>
                <View style={localStyles.gap} />
                <Text style={styles.smallText}>
                  Email: {FIREBASE_AUTH.currentUser?.email}
                </Text>
                <Text style={styles.smallText}>Phone: {user.phoneNumber}</Text>
              </View>
              <View style={localStyles.divider} />
              {/* Address */}
              <View style={localStyles.addressDetails}>
                <Text style={styles.boldText}>Location</Text>
                <Text style={styles.smallText}>
                  Address: {formatAddress(address)}
                </Text>
              </View>
            </View>
          ) : (
            <Text>No user data available</Text> // Display if user is null after loading
          )}


          {
            workerId &&
            <>
              <DynamicButton
                title="Assessments"
                type="primary"
                onPress={async () => navigation.navigate('AssessmentSelection', { workerId: workerId })}
              />
              <DynamicButton
                title="Portfolio and Certifications"
                type="primary"
                onPress={async () => navigation.navigate('Portfolio', { userId: userId, workerId: workerId })}
              />
            </>
          }
          <DynamicButton
            title="Change Password"
            type="primary"
            onPress={async () => navigation.navigate('ChangePassword')}
          />
          <DynamicButton
            title="Switch Mode"
            type="secondary"
            onPress={async () => {
              const currentMode =
                user?.roleId?.[0]?.toString() === user?.defaultRole?.toString()
                  ? 'Client Mode'
                  : 'Worker Mode';

              const newMode =
                user?.roleId?.[0]?.toString() === user?.defaultRole?.toString()
                  ? 'Worker Mode'
                  : 'Client Mode';

              showAlert(
                'Switch Mode?',
                `You are currently in ${currentMode}, and you are about to switch to ${newMode}.\n\nIt requires you to sign in again. Tap anywhere to cancel.`,
                () => {
                  handleUpdateUser();
                },
              );
            }}
          />

          <DynamicButton
            title="Logout"
            type="logout"
            onPress={() => {
              showAlert(
                'Log out?',
                'You are about to Log out.Tap anywhere to cancel',
                () => logOutUser(),
              );
            }} // Handle user role update
          />
          {/* <DynamicButton
            title="Create and Send Notification"
            type="secondary"
            onPress={handleCreateTestNotification} // Handle user role update
          /> */}
        </View>
      </View>
    </ScrollView>
  );
};

const localStyles = StyleSheet.create({
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  badges: {
    alignItems: 'flex-start'
  },
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 4
  },
  container: {
    paddingHorizontal: 30,
    flex: 1,
    marginBottom: 100,
  },
  gap: {
    height: 8,
  },
  verifiedIcon: {},
  containIcon: {
    position: 'absolute',
    bottom: 0,
    right: 4,
    width: 24,
    backgroundColor: Colors.white,
    borderRadius: 32,
  },
  containMode: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Ensure items don't overlap
    alignItems: 'center', // Align items in the center vertically
  },
  modeText: {
    flexShrink: 1, // Prevent the text from taking up full width
    color: Colors.labelText, // Use your label text color
    fontSize: 16, // Adjust font size as needed
  },
  divider: {
    height: 1,
    backgroundColor: Colors.placeholder,
    marginVertical: 16,
  },
  screen: {
    justifyContent: 'center',
    flex: 1,
    paddingTop: 25,
  },
  btnContainerEnd: {
    alignItems: 'flex-end',
  },
  headerContainer: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.placeholder,
    marginVertical: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  initialsContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.labelText,
  },
  contactDetails: {
    // gap: 8,
  },
  addressDetails: {
    gap: 8,
  },
});

export default Profile;
