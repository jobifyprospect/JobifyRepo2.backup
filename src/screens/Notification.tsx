import React, { useCallback, useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { formatDateToReadable } from '../utils/Utils';
import { Notification } from '../services/interfaces/notification';
import {
  fetchNotifications,
  updateNotificationReadStatus,
} from '../services/firestore/notifications';
import BackButton from '../components/BackButton';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import RefreshButton from '../components/RefreshComponent';
import { getCurrentUserUID } from '../services/firestore/users';
import { Timestamp } from '@react-native-firebase/firestore';
import { notificationsRef } from '../config/firebase';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const NotificationScreen = ({ navigation }: RouterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false); // State to track refreshing

  useEffect(() => {
    const fetchAndSubscribe = async () => {
      const uid = await getCurrentUserUID();

      const unsubscribe = notificationsRef
        .where('receiverId', '==', uid)
        .orderBy('createdAt', 'desc')
        .onSnapshot(
          snapshot => {
            const newNotifications: Notification[] = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            } as Notification));
            setNotifications(newNotifications);
            setLoading(false);
            setRefreshing(false);
          },
          error => {
            console.error("Error fetching notifications: ", error);
            setLoading(false);
            setRefreshing(false);
          }
        );

      return unsubscribe;
    };

    const unsubscribe = fetchAndSubscribe();
    return () => {
      unsubscribe.then(unsub => unsub && unsub());
    };
  }, []);

  const getNotifications = async () => {
    try {
      const uid: string | null = await getCurrentUserUID();
      if (!uid) {
        return;
      }

      const notificationsList = await fetchNotifications(uid);
      setNotifications(notificationsList);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false); // Start the refreshing spinner
    }
  };

  // Refetch notifications when the screen is focused
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getNotifications();
    }, []),
  );
  const onRefresh = () => {
    setRefreshing(true); // Start the refreshing spinner
    getNotifications();
  };

  const handleNotificationPress = async (notification: Notification) => {
    try {
      // Only update the read status if it's not already read
      if (!notification.isRead) {
        await updateNotificationReadStatus(notification.id);
        // Update the local state to reflect that the notification has been read
        setNotifications(prevNotifications =>
          prevNotifications.map(n =>
            n.id === notification.id ? { ...n, isRead: true } : n,
          ),
        );
      }
    } catch (error) {
      console.error('Error updating notification read status:', error);
    } finally {
      if (notification.params?.component) {
        if (notification.params.id1 && notification.params.id2 && notification.params.id3) {
          // Case for multiple ids
          navigation.navigate(notification.params.component, {
            worker_id: notification.params.id1,
            job_id: notification.params.id2,
            app_id: notification.params.id3
          });
        } else if (notification.params.id1) {
          // Case for single id
          navigation.navigate(notification.params.component, { id: notification.params.id1 });
        } else {
          navigation.navigate(notification.params.component);
        }
      }
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => handleNotificationPress(item)}
      style={styles.notificationCard}>
      <View style={styles.notificationContent}>
        {/* Conditionally render the circle if isRead is false */}
        {!item.isRead && <View style={styles.unreadIndicator} />}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <Text style={styles.date}>
        {item.createdAt ? formatDateToReadable(item.createdAt as Timestamp) : 'N/A'}
      </Text>
    </TouchableOpacity>
  );


  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <View style={styles.contentContainer}>
          <View style={styles.containHeaderButton}>
            <BackButton onPress={async () => navigation.goBack()} />
            <RefreshButton
              type="primary"
              onPress={onRefresh}
              disabled={refreshing}
            />
          </View>
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            removeClippedSubviews={false}
            ListEmptyComponent={<Text>No notifications available.</Text>}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 25,
  },
  containHeaderButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentContainer: {
    marginBottom: 148,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  unreadIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6, // Makes the view a circle
    backgroundColor: 'red', // You can change this color based on your theme
    marginRight: 10, // Adds spacing between the circle and the text
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});

export default NotificationScreen;
