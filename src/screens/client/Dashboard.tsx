import { View, Text, StyleSheet, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { styles } from '../../styles/Globals';
import { NavigationProp } from '@react-navigation/native';
import NotificationsButton from '../../components/NotificationsButton';
import { faPlusSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import AddJobButton from '../../components/AddJobButton';
import { FIREBASE_AUTH } from '../../config/firebase';
import { getJobsByClient } from '../../services/firestore/jobs';
import { Job } from '../../services/interfaces/job';
import Colors from '../../styles/Colors';
import { formatDate } from '../../utils/Utils';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Dashboard = ({ navigation }: RouterProps) => {

  const [myListings, setMyListings] = useState<Job[]>([]);


  useEffect(() => {
    const currentUserId = FIREBASE_AUTH.currentUser?.uid;

    if (currentUserId) {
      const unsubscribe = getJobsByClient(currentUserId, setMyListings);

      // Cleanup
      return () => unsubscribe();
    }
  }, []);

  return (
    <View style={localStyles.container}>
      <View style={localStyles.screen}>
        <View style={localStyles.btnContainerEnd}>
          <NotificationsButton type="primary" onPress={async () => navigation.navigate('Notification')} />
        </View>

        <View style={localStyles.headerContainer}>
          <Text style={styles.xlargeHeading}> Welcome to Jobify! </Text>

          <View>
            {
              myListings ?
                <FlatList
                  ListHeaderComponent={<Text style={styles.mediumText}> Recent Posts </Text>}
                  ListEmptyComponent={<Text> No data.. </Text>}
                  data={myListings}
                  renderItem={({ item }) => {
                    return (
                      <View key={item.jobId} style={localStyles.jobCard}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={[styles.regularText, { maxWidth: 100, width: 100 }]}> {item.title} </Text>
                          <Text style={[styles.regularText, { flexDirection: 'row', maxWidth: 130, width: 130, textAlign: 'center' }]}>
                            {formatDate(item.createdAt)}
                          </Text>
                          {/* <Text style={[styles.regularText, {maxWidth: 100, width: 100}]}> {new Date(item.createdAt.toString()).toISOString()} </Text> */}
                        </View>
                      </View>
                    )
                  }
                  }
                />
                :
                <Text style={[styles.mediumText, { fontWeight: '400' }]}>
                  Ready to find the worker for you?
                  {'\n'}
                  Press the <FontAwesomeIcon icon={faPlusSquare} />  button to get started
                </Text>
            }
          </View>
        </View>

        <View style={localStyles.btnContainerEnd}>
          <AddJobButton type="primary" onPress={async () => navigation.navigate('Post')} />
        </View>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    flex: 1,
  },
  screen: {
    justifyContent: 'center',
    flex: 1,
    paddingTop: 50,
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
    paddingTop: 100,
    gap: 50,
  },
  jobCard: {
    borderWidth: 1,
    shadowOpacity: 1,
    borderColor: Colors.primaryWithOpacity10,
    shadowColor: Colors.primaryWithOpacity10,
    backgroundColor: Colors.white,
    paddingVertical: 10,
    borderRadius: 5,
    paddingHorizontal: 8,
  },
});

export default Dashboard;
