// services/notificationService.ts
import {showAlert} from '../../components/AlertDialog';
import {FIRESTORE_TIMESTAMP, notificationsRef} from '../../config/firebase';
import {Notification} from '../interfaces/notification';
import {firebase} from '@react-native-firebase/messaging';

export const fetchNotifications = async (
  userId: string | null,
): Promise<Notification[]> => {
  try {
    const snapshot = await notificationsRef
      .where('receiverId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const notifications: Notification[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[];

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw new Error('Failed to fetch notifications');
  }
};
export const checkIfNewNotifications = async (
  receiverId: string | null,
): Promise<boolean> => {
  try {
    const querySnapshot = await notificationsRef
      .where('receiverId', '==', receiverId)
      .where('isRead', '==', false) // Filter by unread notifications
      .limit(1) // Only need to check if there's at least one unread
      .get();

    return !querySnapshot.empty; // Returns true if there is at least one result
  } catch (error) {
    console.error('Error checking notifications:', error);
    return false; // Handle error and assume no unread notifications
  }
};

export const updateNotificationReadStatus = async (notificationId: string) => {
  try {
    // Query the notifications collection for the document with the given userId (or receiverId)
    const querySnapshot = await notificationsRef
      .where('id', '==', notificationId) // Adjust this based on your field name
      .where('isRead', '==', false) // Only query unread notifications
      .limit(1) // Limit to one notification
      .get();

    if (!querySnapshot.empty) {
      const notificationDoc = querySnapshot.docs[0]; // Get the first matching notification

      // Update the read status of the found notification
      await notificationDoc.ref.update({
        isRead: true,
        updatedAt: FIRESTORE_TIMESTAMP, // Assuming you have this constant defined
      });

      console.log(`Notification ${notificationDoc.id} updated successfully`);
    }
  } catch (error) {
    console.error('Error updating notification read status:', error);
  }
};

export const createNotification = async (
  notificationData: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'> & {
    from?: string; // Nullable parameter for sender ID
    to?: string; // Nullable parameter for receiver ID
    messageId?: string; // Nullable parameter for receiver ID
    threadId?: string; // Nullable parameter for receiver ID
    notification?: {title: string; body: string}; // Nullable notification object
  },
): Promise<Notification | null> => {
  try {
    // Create a new notification in Firestore
    const newNotificationRef = await notificationsRef.add(notificationData);

    // Retrieve the newly created notification snapshot
    const newNotificationSnapshot = await newNotificationRef.get();

    const newNotification: Notification = {
      id: newNotificationRef.id,
      ...notificationData,
      createdAt: newNotificationSnapshot.data()?.createdAt,
      updatedAt: newNotificationSnapshot.data()?.updatedAt,
    };

    // Send a message after creating the notification
    const {from, to, notification, messageId, threadId} = notificationData; // Destructure params

    if (from && to && notification) {
      await firebase
        .messaging()
        .sendMessage({
          messageId: messageId,
          threadId: threadId,
          from: from, // Sender ID
          to: to, // Receiver ID
          notification: {
            title: notification.title,
            body: notification.body,
          },
          fcmOptions: {},
        })
        .then(() => {
          showAlert(
            'Success',
            'Test notification created and sent to devices.',
          );
        })
        .catch((error: any) => {
          console.log(`${error} notifications not sent`);
        });
    } else {
      console.log(
        'From, To, and Notification parameters are required to send a message.',
      );
    }

    return newNotification; // Return the newly created notification
  } catch (error) {
    console.error('Error creating notification:', error);
    return null; // Return null if an error occurred
  }
};
