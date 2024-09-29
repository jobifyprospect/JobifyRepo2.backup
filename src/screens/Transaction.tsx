import {View, Text, StyleSheet, FlatList} from 'react-native';
import React, {useEffect, useState} from 'react';
import {styles} from '../styles/Globals';
import Colors from '../styles/Colors';
import {getJobsByClient} from '../services/firestore/jobs';
import {FIREBASE_AUTH} from '../config/firebase';
import {Job} from '../services/interfaces/job';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faPlusSquare} from '@fortawesome/free-regular-svg-icons/faPlusSquare';

export default function Transaction() {
  const [myListings, setMyListings] = useState<Job[]>([]);

  function returnJobStatus(status: string | undefined) {
    switch (status) {
      case 'on going':
        return Colors.primary;
      default:
        return Colors.placeholder;
    }
  }

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
      <View>
        {myListings ? (
          <FlatList
            ListHeaderComponent={
              <Text style={[styles.mediumText, localStyles.containText]}>
                {' '}
                Today{' '}
              </Text>
            }
            ListEmptyComponent={<Text> No data.. </Text>}
            data={myListings}
            renderItem={({item}) => {
              return (
                <View key={item.jobId} style={localStyles.jobCard}>
                  <View style={localStyles.containItems}>
                    <View style={localStyles.jobCardAvatar}>
                      <Text style={localStyles.avatarPlaceholder}> PH </Text>
                    </View>

                    <View style={localStyles.column}>
                      <Text style={[styles.boldText]}>
                        {' '}
                        {item.assignedWorker
                          ? item.assignedWorker
                          : 'Unassigned'}{' '}
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
              );
            }}
          />
        ) : (
          <Text style={[styles.mediumRegularText]}>
            Ready to find the worker for you?
            {'\n'}
            Press the <FontAwesomeIcon icon={faPlusSquare} /> button to get
            started
          </Text>
        )}
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    flex: 1,
  },
  containItems: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 18,
  },
  containText: {paddingVertical: 12},
  row: {flexDirection: 'row'},
  column: {flexDirection: 'column'},
  screen: {
    justifyContent: 'center',
    flex: 1,
    paddingTop: 50,
    paddingBottom: 100,
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
});
