import React, { useCallback, useState, useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { formatDateToReadable } from '../utils/Utils'; // Assuming this function exists
import { Notification } from '../services/interfaces/notification';
import {
  createNotification,
  fetchNotifications,
  sendNotification,
  updateNotificationReadStatus,
} from '../services/firestore/notifications';
import BackButton from '../components/BackButton';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import RefreshButton from '../components/RefreshComponent';
import { getCurrentUserUID } from '../services/firestore/users';
import { FIRESTORE_TIMESTAMP } from '../config/firebase';
import { useFCMToken } from '../config/FCMTokenContext';
import uuid from 'react-native-uuid';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const NotificationScreen = ({ navigation }: RouterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false); // State to track refreshing

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));

      const newNotification: Notification = {
        id: remoteMessage.messageId || uuid.v4(), // Use uuid to generate a unique id
        title: remoteMessage.notification?.title || '',
        subtitle: remoteMessage.notification?.body || '',
        senderId: remoteMessage.data?.senderId?.toString() || '',
        receiverId: remoteMessage.data?.receiverId?.toString() || '',
        createdAt: FIRESTORE_TIMESTAMP,
        updatedAt: FIRESTORE_TIMESTAMP,
        isRead: false,
      };

      try {
        // Insert the new notification into Firestore
        await createNotification(newNotification);

        // Update the local state
        setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
      } catch (error) {
        console.error('Error creating notification in Firestore:', error);
      }
    });

    return unsubscribe;
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
      <Text style={styles.date}>{formatDateToReadable(item.createdAt)}</Text>
    </TouchableOpacity>
  );

  const TestNotificationButton = () => {
    const fcmToken = useFCMToken();

    const handleSendTestNotification = async () => {
      if (fcmToken) {
        await sendNotification(
          fcmToken,
          'Test Notification',
          'This is a test notification sent from within the app.',
          { customData: 'Some custom data' }
        );
      } else {
        console.error('FCM token not available');
      }
    };

    return (
      <Button title="Send Test Notification" onPress={handleSendTestNotification} />
    );
  };
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
              onPress={onRefresh} // Trigger the refresh function
              disabled={refreshing} // Disable button when refreshing
            />
          </View>
          <TestNotificationButton />
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            removeClippedSubviews={false}
            ListEmptyComponent={<Text>No notifications available.</Text>}
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
