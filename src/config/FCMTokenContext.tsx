import React, {createContext, useContext, useState, useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import {handleTokenRefresh} from '../services/firestore/users';
import {getCurrentUserUID} from './firebase';

// Define a context to hold the FCM token
const FCMTokenContext = createContext<string | null>(null);

// Custom hook to access the FCM token
export const useFCMToken = () => {
  return useContext(FCMTokenContext);
};

export const FCMTokenProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      const authStatus = await messaging().requestPermission();
      const isDeviceRegisteredForRemoteMessages =
        messaging().isDeviceRegisteredForRemoteMessages;
      const isAutoInitEnabled = messaging().isAutoInitEnabled;
      const isSupported = messaging().isSupported();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('isAutoInitEnabled:', isAutoInitEnabled);
        console.log('isSupported:', isSupported);
        console.log(
          'isDeviceRegisteredForRemoteMessages:',
          isDeviceRegisteredForRemoteMessages,
        );
        console.log('Authorization status:', authStatus);
        const token = await messaging().getToken();
        console.log('FCM token:', token);
        setFcmToken(token);
      }
    };

    getToken();

    // Listen for FCM token refresh
    const unsubscribe = messaging().onTokenRefresh(async token => {
      console.log('FCM token refreshed:', token);
      const uid = await getCurrentUserUID();
      setFcmToken(token);
      handleTokenRefresh(uid);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <FCMTokenContext.Provider value={fcmToken}>
      {children}
    </FCMTokenContext.Provider>
  );
};
