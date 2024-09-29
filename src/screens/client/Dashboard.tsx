import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {styles} from '../../styles/Globals';
import NotificationsButton from '../../components/NotificationsButton';
import AddJobButton from '../../components/AddJobButton';
import {CURRENT_USER_UID} from '../../config/firebase';
import {getJobsByClient, queryJob} from '../../services/firestore/jobs';
import {Job} from '../../services/interfaces/job';
import Colors from '../../styles/Colors';
import {faPlusSquare} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import DynamicTextInput from '../../components/DynamicTextInput';
import {NavigationProp} from '@react-navigation/native';
import {formatDateToReadable} from '../../utils/Utils';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Dashboard = ({navigation}: RouterProps) => {
  const [myListings, setMyListings] = useState<Job[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state
  // Search function to filter jobs based on any string
  const handleSearch = async (searchTerm: string) => {
    setSearch(searchTerm);

    if (searchTerm.trim() === '') {
      setSearchResults(myListings); // Show all listings if search term is empty
    } else {
      // Filter jobs from the local myListings state
      const filteredJobs = myListings.filter(job => {
        return (
          job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.pay?.toString().includes(searchTerm) || // Assuming pay is a number
          job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });

      // If no local results, check Firestore
      if (filteredJobs.length > 0) {
        setSearchResults(filteredJobs);
      } else {
        // Query Firestore for matching jobs
        const firestoreJobs = await queryJob(searchTerm);
        setSearchResults(firestoreJobs);
      }
    }
  };
  useEffect(() => {
    const currentUserId = CURRENT_USER_UID;

    if (currentUserId) {
      setLoading(true); // Start loading
      getJobsByClient(currentUserId)
        .then(jobs => {
          setMyListings(jobs);
          setSearchResults(jobs); // Initialize search results with fetched jobs
        })
        .catch(error => {
          console.error('Failed to fetch jobs:', error);
          setLoading(false); // Stop loading on error
        })
        .finally(() => {
          setLoading(false); // Stop loading on error
        });
    }
  }, []);

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
          {loading ? ( // Render loading indicator when loading
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
                ListEmptyComponent={
                  <Text style={[styles.regularText, styles.w100]}>
                    Not Existing
                  </Text>
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
                          <Text style={[styles.regularText, styles.bold]}>
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
              <Text style={styles.xlargeHeading}> Welcome to Jobify! </Text>
              <Text style={[styles.mediumRegularText]}>
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
});

export default Dashboard;
