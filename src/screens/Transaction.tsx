import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { styles } from '../styles/Globals';
import Colors from '../styles/Colors';
import { Job } from '../services/interfaces/job';
import {
  getJobsByClient,
  getJobsByWorker,
  queryJob,
} from '../services/firestore/jobs';
import { formatCurrency, formatDateToReadable } from '../utils/Utils';
import DynamicTextInput from '../components/DynamicTextInput';
import { useFocusEffect } from '@react-navigation/native';
import RefreshButton from '../components/RefreshComponent';
import { RootStackParamList } from './interfaces/RouterStackInterfaceParams';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  getCurrentUserUID,
  getUserDefaultRole,
  getUserDefaultUserUid,
} from '../services/firestore/users';
import GetFullName from '../components/GetFullName';
import ProfilePicture from '../components/GetProfilePicture';
// import {getApplicationsByWorkerId} from '../services/firestore/applications';
// import {Application} from '../services/interfaces/application';

type TransactionProps = BottomTabScreenProps<RootStackParamList, 'Transaction'>;

export default function Transaction({ navigation, route }: TransactionProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  // const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [role, setRole] = useState<string | null>(route.params._role || null);
  const [isLoading, setIsLoading] = useState<boolean>(true);


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
    try {
      const uid: string | null = await getCurrentUserUID();
      const workerUid: string | null = await getUserDefaultUserUid();
      if (uid) {
        if (role === 'client') {
          const jobbers = await getJobsByClient(uid);
          setJobs(jobbers);
          setSearchResults(jobbers);
        } else if (role === 'worker') {
          const myJobListings = await getJobsByWorker(workerUid);
          setJobs(myJobListings);
          setSearchResults(myJobListings);
        }
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsLoading(false); // Stop the loading spinner
    }
  }, [role]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchDefaultRole();
      await fetchJobs();
    } finally {
      setRefreshing(false);
    }
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
      case 'ongoing':
        return Colors.primary;
      default:
        return Colors.placeholder;
    }
  }

  if (isLoading && !refreshing) {
    return (
      <View style={localStyles.contentLoading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.mediumText}> Loading Transactions.. </Text>
      </View>
    );
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
        renderItem={({ item, index }) => {
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
                  navigation.navigate(role === 'worker' ? 'JobDetailsWorker' : 'JobDetailsClient', { id: item.jobId })
                }
                key={item.jobId}
                style={[localStyles.jobCard, getCardStyle()]}>
                <View style={localStyles.containCard}>
                  <ProfilePicture
                    uuId={item.assignedWorker ?? ''}
                    type={'worker'}
                  />
                  <View style={localStyles.jobInfoContainer}>
                    <View style={localStyles.row}>
                      {item.assignedWorker ? (
                        <GetFullName
                          uuId={item.assignedWorker}
                          type={'worker'}
                        />
                      ) : (
                        <Text
                          style={[styles.regularText, styles.bold]}
                          numberOfLines={1}>
                          Unassigned
                        </Text>
                      )}
                      <Text>{formatCurrency(item.pay ?? 0)}</Text>
                    </View>

                    <View style={localStyles.row}>
                      <Text
                        style={[styles.regularText, localStyles.containText]}
                        numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={[{ color: returnJobStatus(item.status) }]}>
                        {item.assignedWorker ? item.status === 'closed' ? 'Done'
                          : item.status
                          : 'Pending'
                        }
                      </Text>
                    </View>
                  </View>
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
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    width: 160,
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
    flexDirection: 'column',
    // marginRight: 10,
  },
  contentLoading: {
    flex: 1,
    rowGap: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
