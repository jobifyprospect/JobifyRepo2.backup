// services/notificationService.ts
import {FIRESTORE_TIMESTAMP, notificationsRef} from '../../config/firebase';
import {Notification} from '../interfaces/notification';

export const fetchNotifications = async (
  userId: string | null,
): Promise<Notification[]> => {
  try {
    const snapshot = await notificationsRef
      .where('receiverId', '==', userId)
      .orderBy('createdAt', 'asc')
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
    } else {
      console.error('No unread notifications found for the user.');
    }
  } catch (error) {
    console.error('Error updating notification read status:', error);
  }
};

// Function to create a new notification
export const createNotification = async (
  notificationData: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Notification | null> => {
  try {
    const newNotificationRef = await notificationsRef.add(notificationData);

    // Retrieve the newly created notification
    const newNotification: Notification = {
      id: newNotificationRef.id,
      ...notificationData,
      createdAt: (await newNotificationRef.get()).data()?.createdAt, // Get the createdAt timestamp from Firestore
      updatedAt: (await newNotificationRef.get()).data()?.updatedAt, // Get the updatedAt timestamp from Firestore
    };

    return newNotification; // Return the newly created notification
  } catch (error) {
    console.error('Error creating notification:', error);
    return null; // Return null if an error occurred
  }
};
