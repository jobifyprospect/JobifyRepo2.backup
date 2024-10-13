import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import {NavigationProp, useFocusEffect} from '@react-navigation/native';
import {FIREBASE_AUTH, getCurrentUserUID} from '../../config/firebase';
import {
  getAllJobsWithUserDetails,
  queryJob,
} from '../../services/firestore/jobs';
import NotificationsButton from '../../components/NotificationsButton';
import DynamicTextInput from '../../components/DynamicTextInput';
import Colors from '../../styles/Colors';
import {formatDateToReadable} from '../../utils/Utils';
import {styles} from '../../styles/Globals';
import {onAuthStateChanged} from '@react-native-firebase/auth';
import {getUser, storeFcmToken} from '../../services/firestore/users';
import {firebase} from '@react-native-firebase/messaging';
import {showAlert} from '../../components/AlertDialog';
import {useFCMToken} from '../../config/FCMTokenContext';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Dashboard = ({ navigation }: RouterProps) => {
  const [myListings, setMyListings] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentRoleId, setCurrentRoleId] = useState<string | undefined>(
    undefined,
  );
  const fcmToken = useFCMToken();
  // Fetch jobs for the current user
  const fetchJobs = useCallback(async (roleId: string | undefined) => {
    if (!roleId) {
      console.log(`${roleId} NO ID`);
      return; // Early return if no role ID
    }

    setLoading(true); // Set loading to true while fetching
    try {
      const jobs = await getAllJobsWithUserDetails();
      setMyListings(jobs);
      setSearchResults(jobs);

      if (!jobs) {
        setLoading(false)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false); // Stop refreshing after data fetch
    }
  }, []);

  // Pull down to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJobs(currentRoleId); // Pass currentRoleId to fetchJobs
  }, [fetchJobs, currentRoleId]);

  // Handle job search
  const handleSearch = useCallback(
    async (searchTerm: string) => {
      setSearch(searchTerm);

      if (searchTerm.trim() === '') {
        setSearchResults(myListings); // Show all listings if search term is empty
        return;
      }

      const filteredJobs = myListings.filter(
        job =>
          [job.title, job.description, job.location].some(field =>
            field?.toLowerCase().includes(searchTerm.toLowerCase()),
          ) || job.pay?.toString().includes(searchTerm),
      );

      if (filteredJobs.length > 0) {
        console.log('TYPED SEARCH');

        setSearchResults(filteredJobs);
      } else {
        console.log('DB SEARCH');

        const firestoreJobs = await queryJob(searchTerm);
        setSearchResults(firestoreJobs);
      }
    },
    [myListings],
  );

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(
      FIREBASE_AUTH,
      async (user: any) => {
        if (user) {
          const currentRole = await getUser(user.uid);
          const uid = await getCurrentUserUID();
          if (currentRole) {
            setCurrentRoleId(currentRole.defaultRole);
          }
          await storeFcmToken(uid, fcmToken); // Store the new token
        } else {
          // Reset state when user logs out or there is no user
          setMyListings([]);
          setSearchResults([]);
          setSearch('');
          setLoading(false);
        }
      },
    );

    // Cleanup auth listener on unmount
    return () => unsubscribeAuth();
  }, [fcmToken]);

  // Fetch jobs when currentRoleId changes
  useEffect(() => {
    if (currentRoleId) {
      fetchJobs(currentRoleId);
    }
  }, [currentRoleId, fetchJobs]);

  // Fetch jobs when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (currentRoleId) {
        fetchJobs(currentRoleId);
      }
    }, [fetchJobs, currentRoleId]),
  );
  useEffect(() => {
    const unsubscribe = firebase.messaging().onMessage(async remoteMessage => {
      if (remoteMessage) {
        // Check for the logged-in user
        const currentUser = FIREBASE_AUTH.currentUser;
        if (currentUser) {
          showAlert('Notification', 'There is a new notification', () =>
            navigation.navigate('Notification'),
          );
        } else {
          console.log('ON MESSAGE: No user is logged in.');
        }

        console.log('ON MESSAGE', remoteMessage);
      }
    });
    return unsubscribe;
  }, [navigation]);
  return (
    <View style={localStyles.container}>
      <View style={localStyles.screen}>
        <SafeAreaView style={localStyles.btnContainerEnd}>
          <NotificationsButton
            type="primary"
            onPress={async () => navigation.navigate('Notification')}
          />
        </SafeAreaView>

        <>
          {loading ? ( // Render loading indicator when loading
            <ActivityIndicator
              style={localStyles.container}
              size="large"
              color={Colors.primary}
            />
          ) : myListings.length > 0 ? (
            <View style={localStyles.headerContainer}>
              <Text style={styles.largeHeading}>Jobs Listed</Text>
              <DynamicTextInput
                value={search}
                onChangeText={handleSearch}
                prefixIcon="magnifying-glass"
                placeholder="Search"
                isRequired
              />
              <FlatList
                data={searchResults}
                style={localStyles.flatList}
                removeClippedSubviews={false}
                ListEmptyComponent={
                  searchResults.length === 0 && search ? (
                    <Text style={[styles.mediumRegularText]}>
                      Search Not found
                    </Text>
                  ) : (
                    <Text style={[styles.mediumRegularText]}>No data</Text>
                  )
                }
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
                keyExtractor={item => item?.job?.jobId?.toString()}
                renderItem={({ item, index }) => {
                  const currentItemDate = formatDateToReadable(
                    item.job.createdAt,
                  );
                  const previousItemDate =
                    index > 0
                      ? formatDateToReadable(
                        myListings[index - 1].job.createdAt,
                      )
                      : null;
                  const nextItemDate =
                    index < myListings.length - 1
                      ? formatDateToReadable(
                        myListings[index + 1].job.createdAt,
                      )
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
                  const initials =
                    `${item?.user?.firstName[0]}${item?.user?.lastName[0]}`.toUpperCase();
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
                        key={item.job.jobId}
                        style={[localStyles.jobCard, getCardStyle()]}
                        onPress={() => navigation.navigate('ApplyToJob', { id: item.job.jobId })}
                      >
                        <View style={localStyles.containCard}>
                          <View style={localStyles.profileContainer}>
                            {item?.user?.profilePicture ? (
                              <Image
                                source={{ uri: item?.user?.profilePicture }}
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
                          {/* Job Title and Address */}
                          <View style={localStyles.jobInfoContainer}>
                            <Text
                              style={[styles.regularText, styles.bold]}
                              numberOfLines={1}>
                              {item.job.title}
                            </Text>

                            <Text style={styles.regularText} numberOfLines={1}>
                              {item?.job.location || 'Not available'}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.mediumTextBlue,
                              localStyles.containText,
                            ]}>
                            Php {item.job.pay}
                          </Text>
                        </View>
                      </Pressable>
                    </>
                  );
                }}
              />
            </View>
          ) : (
            <>
              <Text style={styles.xlargeHeading}>
                {' '}
                {'\n'}Welcome to Jobify!{' '}
              </Text>
              <Text style={[styles.mediumRegularText]}>
                {'\n'}
                {'\n'}
                Please wait for jobs to be listed..
                {'\n'}
              </Text>
            </>
          )}
        </>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    flex: 1,
  },
  containCard: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  containText: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Align items to the bottom
    alignSelf: 'flex-end', // Center align items horizontally
    textAlign: 'center', // Center align text within each item
  },
  flatList: {
    marginBottom: 100,
  },
  containHeader: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  screen: {
    justifyContent: 'center',
    flex: 1,
    paddingTop: 25,
    // paddingBottom: 10,
  },
  btnContainerEnd: {
    alignItems: 'flex-end',
  },
  listContainer: {
    flex: 0.8,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.placeholder,
    borderRadius: 8,
  },
  headerContainer: {
    flex: 1,
  },
  jobCard: {
    borderColor: Colors.placeholder,
    backgroundColor: Colors.white,
    paddingVertical: 10,
    borderRadius: 5,
    paddingHorizontal: 8,
  },
  profileContainer: {
    marginRight: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  jobInfoContainer: {
    flex: 1,
    marginRight: 10,
  },
});

export default Dashboard;
