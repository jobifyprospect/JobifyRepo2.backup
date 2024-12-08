import messaging from '@react-native-firebase/messaging';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUserUID, handleTokenRefresh } from '../services/firestore/users';

const FCMTokenContext = createContext<string | null>(null);

export const useFCMToken = () => useContext(FCMTokenContext);

export const FCMTokenProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      setFcmToken(token);
      const uid = await getCurrentUserUID();
      if (uid) {
        await handleTokenRefresh(uid, token);
      }
    };

    getToken();

    const unsubscribe = messaging().onTokenRefresh(async (token) => {
      setFcmToken(token);
      const uid = await getCurrentUserUID();
      if (uid) {
        await handleTokenRefresh(uid, token);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <FCMTokenContext.Provider value={fcmToken}>
      {children}
    </FCMTokenContext.Provider>
  );
};

