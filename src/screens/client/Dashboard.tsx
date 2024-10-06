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
import {FIREBASE_AUTH, getCurrentUserUID} from '../../config/firebase';
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

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Dashboard = ({navigation}: RouterProps) => {
  const [myListings, setMyListings] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<any>(null);

  // Fetch jobs for the current user
  const fetchJobs = useCallback(async () => {
    if (currentUserId) {
      getJobsByClient(currentUserId)
        .then(jobs => {
          setMyListings(jobs);
          setSearchResults(jobs);
        })
        .catch(error => {
          console.error('Failed to fetch jobs:', error);
        })
        .finally(() => {
          setLoading(false);
          setRefreshing(false); // Stop refreshing after data fetch
        });
    }
  }, [currentUserId]);

  // Pull down to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJobs();
  }, [fetchJobs]);

  // Handle job search
  const handleSearch = useCallback(
    async (searchTerm: string) => {
      setSearch(searchTerm);

      if (searchTerm.trim() === '') {
        setSearchResults(myListings); // Show all listings if search term is empty
      } else {
        const filteredJobs = myListings.filter(
          job =>
            [job.title, job.description, job.location]
              .map(field =>
                field?.toLowerCase().includes(searchTerm.toLowerCase()),
              )
              .some(Boolean) || job.pay?.toString().includes(searchTerm), // Assuming pay is a number
        );

        if (filteredJobs.length > 0) {
          setSearchResults(filteredJobs);
        } else {
          const firestoreJobs = await queryJob(searchTerm);
          setSearchResults(firestoreJobs);
        }
      }
    },
    [myListings],
  );

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      const uid = await getCurrentUserUID();
      setCurrentUserId(uid);
    };

    fetchCurrentUserId();
    const unsubscribeAuth = onAuthStateChanged(
      FIREBASE_AUTH,
      async (user: any) => {
        if (user) {
          fetchJobs(); // Ensure jobs are fetched after UID is set
          handleSearch(''); // Reset search on user change
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
  }, [fetchJobs, handleSearch]);

  // Fetch jobs when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (currentUserId) {
        fetchJobs();
      }
    }, [fetchJobs, currentUserId]),
  );

  return (
    <View style={localStyles.container}>
      <View style={localStyles.screen}>
        <SafeAreaView style={localStyles.btnContainerEnd}>
          <NotificationsButton
            type="primary"
            onPress={async () => navigation.navigate('Notification')}
          />
        </SafeAreaView>

        <View style={localStyles.headerContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : myListings.length > 0 ? (
            <>
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
                removeClippedSubviews={false}
                ListEmptyComponent={
                  <Text style={[styles.regularText, styles.w100]}>
                    Not Existing
                  </Text>
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
            </>
          ) : (
            <>
              <Text style={styles.xlargeHeading}>{'\n'}Welcome to Jobify!</Text>
              <Text style={[styles.mediumRegularText]}>
                {'\n'} {'\n'}
                Ready to find the worker for you?
                {'\n'}
                Press the <FontAwesomeIcon icon={faPlusSquare} /> button to get
                started
              </Text>
            </>
          )}
        </View>

        <SafeAreaView style={localStyles.btnContainerEnd}>
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
  containCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    paddingBottom: 100,
  },
  btnContainerEnd: {
    alignItems: 'flex-end',
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
