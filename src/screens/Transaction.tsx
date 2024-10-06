import {View, Text, StyleSheet, FlatList} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {styles} from '../styles/Globals';
import Colors from '../styles/Colors';
import {Job} from '../services/interfaces/job';
import {getCurrentUserUID} from '../config/firebase';
import {getUser} from '../services/firestore/users';
import {getJobsByClient, queryJob} from '../services/firestore/jobs';
import {formatDateToReadable} from '../utils/Utils';
import DynamicTextInput from '../components/DynamicTextInput';
import {NavigationProp} from '@react-navigation/native';
import RefreshButton from '../components/RefreshComponent';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

export default function Transaction({}: RouterProps) {
  const [myListings, setMyListings] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [currentUserId, setCurrentUserId] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false); // State to track refreshing

  // Search handler with debouncing to optimize performance
  const handleSearch = useCallback(
    async (searchTerm: string) => {
      setSearch(searchTerm);

      if (searchTerm.trim() === '') {
        // If search term is empty, show all listings
        setSearchResults(myListings);
        return;
      }

      // Filter jobs based on the search term
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
        // If no results from local data, query from Firestore
        const firestoreJobs = await queryJob(searchTerm);
        setSearchResults(firestoreJobs);
      }
    },
    [myListings],
  );

  const fetchJobs = useCallback(async () => {
    try {
      const uid: string | null = await getCurrentUserUID();
      if (uid) {
        const currentRole = await getUser(uid);
        if (currentRole && currentRole.defaultRole) {
          setCurrentUserId(currentRole.defaultRole);
          if (currentUserId) {
            const jobs = await getJobsByClient(currentUserId);
            setMyListings(jobs);
            setSearchResults(jobs);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setRefreshing(false); // Stop the refreshing spinner
    }
  }, [currentUserId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true); // Start the refreshing spinner
    fetchJobs(); // Refresh the job data
  }, [fetchJobs]);

  useEffect(() => {
    fetchJobs(); // Initial fetch when the component mounts
  }, [fetchJobs]);

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
        style={localStyles.flatList} // Style for the FlatList
        removeClippedSubviews={false}
        ListEmptyComponent={
          searchResults.length === 0 && search ? (
            <Text style={[styles.mediumRegularText]}>Search Not found</Text>
          ) : (
            <Text style={[styles.mediumRegularText]}>No data</Text>
          )
        }
        data={searchResults} // Display searchResults instead of myListings
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
                <View style={localStyles.containItems}>
                  <View style={localStyles.jobCardAvatar}>
                    <Text style={localStyles.avatarPlaceholder}> PH </Text>
                  </View>

                  <View style={localStyles.column}>
                    <Text style={[styles.boldText]}>
                      {item.assignedWorker ? item.assignedWorker : 'Unassigned'}
                    </Text>

                    <View style={localStyles.row}>
                      <Text style={[styles.smallText]}> {item.title} </Text>
                      <Text style={styles.smallText}> - </Text>
                      <Text style={[styles.smallText]}> PHP {item.pay} </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      localStyles.statusText,
                      {color: returnJobStatus(item.status)},
                    ]}>
                    {item.assignedWorker ? item.status : null}
                  </Text>
                </View>
              </View>
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
  btnContainerEnd: {
    alignItems: 'flex-end',
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
    backgroundColor: Colors.primaryWithOpacity10,
    borderRadius: 100,
  },
  avatarPlaceholder: {
    height: 52,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: Colors.primary,
    fontSize: 18,
  },
  statusText: {
    marginLeft: 'auto',
  },
  flatList: {
    marginBottom: 100,
  },
});
