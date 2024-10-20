import {View, Text, StyleSheet, FlatList, Pressable} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {styles} from '../styles/Globals';
import Colors from '../styles/Colors';
import {Job} from '../services/interfaces/job';
import {getJobsByClient, queryJob} from '../services/firestore/jobs';
import {formatDateToReadable} from '../utils/Utils';
import DynamicTextInput from '../components/DynamicTextInput';
import {useFocusEffect} from '@react-navigation/native';
import RefreshButton from '../components/RefreshComponent';
import {RootStackParamList} from './interfaces/RouterStackInterfaceParams';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {
  getCurrentUserUID,
  getUserDefaultRole,
} from '../services/firestore/users';
import WorkerItem from '../components/GetWorkerFullName';
import ProfilePicture from '../components/GetWorkerProfilePicture';
// import {getApplicationsByWorkerId} from '../services/firestore/applications';
// import {Application} from '../services/interfaces/application';

type TransactionProps = BottomTabScreenProps<RootStackParamList, 'Transaction'>;

export default function Transaction({navigation, route}: TransactionProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  // const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [role, setRole] = useState<string | null>(route.params._role || null);

  const fetchDefaultRole = useCallback(async () => {
    if (!role) {
      const defaultRole = await getUserDefaultRole();
      if (defaultRole) {
        setRole(defaultRole); // Assuming the first role is default
      }
    }
  }, [role]);
  useEffect(() => {
    if (role === null) {
      fetchDefaultRole(); // Fetch default role if necessary
    }
  }, [fetchDefaultRole, role]);
  // Search handler with debouncing to optimize performance
  const handleSearch = useCallback(
    async (searchTerm: string) => {
      setSearch(searchTerm);

      if (searchTerm.trim() === '') {
        // If search term is empty, show all listings
        setSearchResults(jobs);
        return;
      }

      // Filter jobs based on the search term
      const filteredJobs = jobs.filter(
        job =>
          [job.title, job.description, job.location].some(field =>
            field?.toLowerCase().includes(searchTerm.toLowerCase()),
          ) || job.pay?.toString().includes(searchTerm),
      );

      if (filteredJobs.length > 0) {
        setSearchResults(filteredJobs);
      } else {
        const firestoreJobs = await queryJob(searchTerm);
        setSearchResults(firestoreJobs);
      }
    },
    [jobs],
  );

  const fetchJobs = useCallback(async () => {
    setRefreshing(true); // Start the refreshing spinner
    try {
      const uid: string | null = await getCurrentUserUID();
      if (uid) {
        if (role === 'client') {
          const jobbers = await getJobsByClient(uid);
          setJobs(jobbers);
          setSearchResults(jobbers);
        } else if (role === 'worker') {
          const myJobListings = await getJobsByClient(uid);
          setJobs(myJobListings);
          setSearchResults(myJobListings);
        }
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setRefreshing(false); // Stop the refreshing spinner
    }
  }, [role]);

  const onRefresh = useCallback(() => {
    fetchDefaultRole();
    fetchJobs(); // Refresh the job data
  }, [fetchDefaultRole, fetchJobs]);

  // const fetchApplications = useCallback(async () => {
  //   if (role === 'worker' && currentUserId) {
  //     const applications = await getApplicationsByWorkerId(currentUserId);
  //     setMyApplications(applications);
  //     const jobberIds = applications.map(application => application.jobId);
  //     setJobIds(jobberIds);
  //   }
  // }, [currentUserId, role]);

  useFocusEffect(
    useCallback(() => {
      fetchJobs();
      // fetchApplications();
    }, [fetchJobs]),
  );

  function returnJobStatus(status: string | undefined) {
    switch (status) {
      case 'on going':
        return Colors.primary;
      default:
        return Colors.placeholder;
    }
  }

  return (
    <View style={localStyles.container}>
      <View style={localStyles.btnContainerEnd}>
        <RefreshButton
          type="primary"
          onPress={onRefresh} // Trigger the refresh function
          disabled={refreshing} // Disable button when refreshing
        />
      </View>
      <Text style={styles.largeHeading}>Transactions</Text>
      <DynamicTextInput
        value={search}
        onChangeText={handleSearch} // Use handleSearch directly for input change
        prefixIcon="magnifying-glass"
        placeholder="Search"
        isRequired
      />
      <FlatList
        style={localStyles.flatList}
        removeClippedSubviews={false}
        ListEmptyComponent={
          searchResults.length === 0 && search ? (
            <Text style={[styles.mediumRegularText]}>Search Not found</Text>
          ) : (
            <Text style={[styles.mediumRegularText]}>No data</Text>
          )
        }
        data={searchResults} // Display searchResults
        renderItem={({item, index}) => {
          const currentItemDate = formatDateToReadable(item.createdAt);
          const previousItemDate =
            index > 0
              ? formatDateToReadable(searchResults[index - 1].createdAt)
              : null;
          const nextItemDate =
            index < searchResults.length - 1
              ? formatDateToReadable(searchResults[index + 1].createdAt)
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
          // const initials =
          //   `${item?.user?.firstName[0]}${item?.user?.lastName[0]}`.toUpperCase();
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
                onPress={() =>
                  navigation.navigate('JobDetailsClient', {id: item.jobId})
                }
                key={item.jobId}
                style={[localStyles.jobCard, getCardStyle()]}>
                <View style={localStyles.containCard}>
                  <ProfilePicture workerId={item.assignedWorker} />
                  <View style={localStyles.jobInfoContainer}>
                    {item.assignedWorker ? (
                      <WorkerItem workerId={item.assignedWorker} />
                    ) : (
                      <Text
                        style={[styles.regularText, styles.bold]}
                        numberOfLines={1}>
                        Unassigned
                      </Text>
                    )}

                    <View style={localStyles.row}>
                      <Text style={styles.regularText} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text>
                        {' - PHP'} {item.pay}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      {color: returnJobStatus(item.status)},
                      localStyles.containText,
                    ]}>
                    {item.assignedWorker ? item.status : 'N/A'}
                  </Text>
                </View>
              </Pressable>
            </>
          );
        }}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    paddingTop: 25,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    width: 164,
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
