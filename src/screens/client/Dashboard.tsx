import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import {NavigationProp, useFocusEffect} from '@react-navigation/native';
import {FIREBASE_AUTH} from '../../config/firebase';
import {getJobsByClient, queryJob} from '../../services/firestore/jobs';
import {Job} from '../../services/interfaces/job';
import NotificationsButton from '../../components/NotificationsButton';
import AddJobButton from '../../components/AddJobButton';
import DynamicTextInput from '../../components/DynamicTextInput';
import Colors from '../../styles/Colors';
import {faPlusSquare} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {formatDateToReadable} from '../../utils/Utils';
import {styles} from '../../styles/Globals';
import {onAuthStateChanged} from '@react-native-firebase/auth';
import {getUser} from '../../services/firestore/users';
import messaging from '@react-native-firebase/messaging';
import {showAlert} from '../../components/AlertDialog';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Dashboard = ({navigation}: RouterProps) => {
  const [myListings, setMyListings] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentRoleId, setCurrentRoleId] = useState<string | undefined>(
    undefined,
  );
  const fetchJobs = useCallback(async (roleId: string | undefined) => {
    if (!roleId) {
      console.log(`${roleId} NO ID`);
      return; // Early return if no role ID
    }

    setLoading(true); // Set loading to true while fetching
    try {
      const jobs = await getJobsByClient(roleId);
      setMyListings(jobs);
      setSearchResults(jobs);
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
          if (currentRole) {
            setCurrentRoleId(currentRole.defaultRole);
          }
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
  }, []);

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
    const unsubscribe = messaging().onMessage(async remoteMessage => {
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
              size="large"
              style={localStyles.container}
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
                keyExtractor={item => item?.jobId?.toString()}
                renderItem={({item, index}) => {
                  const currentItemDate = formatDateToReadable(item.createdAt);
                  const previousItemDate =
                    index > 0
                      ? formatDateToReadable(myListings[index - 1].createdAt)
                      : null;
                  const nextItemDate =
                    index < myListings.length - 1
                      ? formatDateToReadable(myListings[index + 1].createdAt)
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
                      <View
                        key={item.jobId}
                        style={[localStyles.jobCard, getCardStyle()]}>
                        <View style={localStyles.containCard}>
                          <Text
                            style={[styles.regularText, styles.bold]}
                            numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text
                            style={[
                              styles.regularText,
                              localStyles.containText,
                            ]}>
                            Php {item.pay}
                          </Text>
                        </View>
                      </View>
                    </>
                  );
                }}
              />
            </View>
          ) : (
            <View style={localStyles.emptyContainer}>
              <Text style={styles.xlargeHeading}>
                {' '}
                {'\n'}Welcome to Jobify!{' '}
              </Text>
              <Text style={[styles.mediumRegularText]}>
                {'\n'} {'\n'}
                Ready to find the worker for you?
                {'\n'}
                Press the <FontAwesomeIcon icon={faPlusSquare} /> button to get
                started
              </Text>
            </View>
          )}
        </>

        <SafeAreaView style={localStyles.bottomContainerPlus}>
          <AddJobButton
            type="primary"
            onPress={async () => navigation.navigate('Post')}
          />
        </SafeAreaView>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
  },
  containCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flatList: {
    marginBottom: 100,
  },
  containText: {
    flexDirection: 'row',
    textAlign: 'center',
  },
  containHeader: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  screen: {
    justifyContent: 'center',
    flex: 1,
    paddingTop: 25,
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
  bottomContainerPlus: {
    position: 'absolute',
    alignItems: 'flex-end',
    right: 0,
    bottom: 100,
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
});

export default Dashboard;
