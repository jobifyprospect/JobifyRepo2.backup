import React, {useEffect, useState} from 'react';
import 'react-native-get-random-values';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Login from './src/screens/auth/Login';
import Transaction from './src/screens/Transaction';
import Profile from './src/screens/Profile';
import {onAuthStateChanged} from '@react-native-firebase/auth';
import {FIREBASE_AUTH, FIRESTORE_DB} from './src/config/firebase';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faHouse,
  faFile,
  faUser,
  faBell,
} from '@fortawesome/free-solid-svg-icons';
import {library} from '@fortawesome/fontawesome-svg-core';
import WorkerDashboard from './src/screens/worker/Dashboard'; // worker dashboard
import ClientDashboard from './src/screens/client/Dashboard'; // client dashboard
import ForgotPassword from './src/screens/auth/forgot/ForgotPassword';
import {Platform} from 'react-native';
import UserTypeSelection from './src/screens/auth/create/UserTypeSelection';
import PersonalDetails from './src/screens/auth/create/PersonalDetails';
import {RootStackParamList} from './src/screens/interfaces/RouterStackInterfaceParams';
import AddressDetails from './src/screens/auth/create/AddressDetails';
import LoginInfo from './src/screens/auth/create/LoginInfo';
import PasswordCreation from './src/screens/auth/create/PasswordCreation';
import IDUpload from './src/screens/auth/create/IdUpload';
import Success from './src/screens/utils/Success';

import {getRole} from './src/services/firestore/roles';
import {showAlert} from './src/components/AlertDialog';
import Notification from './src/screens/Notification';
import PostJob from './src/screens/client/PostJob';
import {enableScreens} from 'react-native-screens';
import SplashScreen from './src/screens/Splashscreen';
import LoadingScreen from './src/screens/utils/LoadingScreen';
import ChangePassword from './src/screens/auth/ChangePassword';
import EditUserDetails from './src/screens/EditUserDetails';
import {FCMTokenProvider} from './src/config/FCMTokenContext';

// import {FCMTokenProvider} from './src/config/FCMTokenContext';

library.add(faHouse, faFile, faUser, faBell);
enableScreens();

import messaging, {firebase} from '@react-native-firebase/messaging';

// Register background handler
firebase.messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Check for the logged-in user
  const currentUser = FIREBASE_AUTH.currentUser;
  if (currentUser) {
    console.log('Background Message: User is logged in:', currentUser.uid);
  } else {
    console.log('Background Message: No user is logged in.');
  }

  console.log('Message handled in the background!', remoteMessage);
});

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

export const HomeIcon = ({color}: {color: string}) => (
  <FontAwesomeIcon icon={faHouse} size={16} color={color} />
);

export const TransactionIcon = ({color}: {color: string}) => (
  <FontAwesomeIcon icon={faFile} size={16} color={color} />
);

export const ProfileIcon = ({color}: {color: string}) => (
  <FontAwesomeIcon icon={faUser} size={16} color={color} />
);

const DashboardStack = ({role}: {role: string | null}) => {
  const DashboardComponent =
    role === 'worker' ? WorkerDashboard : ClientDashboard;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false); // Simulate loading time, replace with your logic
    }, 2000); // Set your desired loading time

    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  return (
    <Stack.Navigator>
      {isLoading ? (
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
          options={{headerShown: false}} // Hide header for Loading Screen
        />
      ) : (
        <>
          <Stack.Screen
            name="ClientDashboardScreen"
            component={DashboardComponent}
            options={{headerShown: false}} // Dashboard Screen
          />
          <Stack.Screen
            name="Notification"
            component={Notification}
            options={{title: 'Notifications', headerShown: false}} // Notification Screen
          />
          <Stack.Screen
            name="EditUserDetails"
            component={EditUserDetails}
            options={{headerShown: false}}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

const TabLayout = ({role}: {role: string | null}) => {
  return (
    <Tab.Navigator
      detachInactiveScreens={false}
      screenOptions={({route}) => ({
        tabBarActiveTintColor: '#00A1D7',
        tabBarInactiveTintColor: '#979090',
        tabBarLabelStyle: {fontSize: 12},
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 40 : 20,
          elevation: 5,
          backgroundColor: '#fff',
          borderRadius: 8,
          height: 60,
          left: 24,
          right: 24,
          paddingBottom: 10,
          paddingTop: 10,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({color, focused}) => {
          switch (route.name) {
            case 'Home':
              return <HomeIcon color={focused ? color : '#979090'} />;
            case 'Transaction':
              return <TransactionIcon color={focused ? color : '#979090'} />;
            case 'Profile':
              return <ProfileIcon color={focused ? color : '#979090'} />;
            default:
              return null;
          }
        },
      })}>
      <Tab.Screen
        name="Home"
        children={() => <DashboardStack role={role} />} // Stack for Dashboard
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Transaction"
        component={Transaction}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{headerShown: false}}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = firebase
      .messaging()
      .onSendError(async remoteMessage => {
        console.log('Send error', remoteMessage);
      });
    return unsubscribe;
  }, []);
  useEffect(() => {
    const unsubscribe = firebase
      .messaging()
      .onMessageSent(async remoteMessage => {
        console.log('Message sent', remoteMessage);
      });
    return unsubscribe;
  }, []);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      FIREBASE_AUTH,
      async (authUser: any) => {
        if (authUser) {
          try {
            setUser(authUser);
            const userDoc = await FIRESTORE_DB.collection('users')
              .doc(authUser.uid)
              .get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              if (userData && userData.defaultRole) {
                const foundRole = await getRole(userData.defaultRole);
                if (foundRole) {
                  if (userData.roleId[0] === foundRole.roleId) {
                    setRole('client');
                    const TOPIC = `client-${authUser.uid}`;
                    messaging()
                      .subscribeToTopic(TOPIC)
                      .then(() => {
                        console.log(`TOPIC: ${TOPIC} Subscribed`);
                      });
                  } else if (userData.roleId[1] === foundRole.roleId) {
                    setRole('worker');
                    const TOPIC = `worker-${authUser.uid}`;
                    messaging()
                      .subscribeToTopic(TOPIC)
                      .then(() => {
                        console.log(`TOPIC: ${TOPIC} Subscribed`);
                      });
                  } else {
                    setRole(null);
                  }
                } else {
                  showAlert('Error', 'Role not found.');
                  setRole(null);
                }
              } else {
                setRole(null);
              }
            } else {
              setRole(null);
            }
          } catch (error) {
            showAlert('Error', 'Failed to retrieve user data.');
            setRole(null);
          }
        } else {
          setUser(null);
          setRole(null);
        }
      },
    );

    return unsubscribe;
  }, []);

  // Handle navigation from splash screen
  const handleNavigate = () => {
    // Navigate to the appropriate screen based on user state
    setLoading(false); // Stop loading on button press
  };
  // Show the splash screen while loading
  if (loading) {
    return <SplashScreen onNavigate={handleNavigate} />;
  }

  return (
    <FCMTokenProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          {user ? (
            <>
              <Stack.Screen
                name="Inside"
                children={() => <TabLayout role={role} />}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Post"
                component={PostJob}
                options={{title: 'Post', headerShown: false}}
              />
              <Stack.Screen
                name="ChangePassword"
                component={ChangePassword}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="EditUserDetails"
                component={EditUserDetails}
                options={{headerShown: false}}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Login"
                component={Login}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="UserTypeSelection"
                component={UserTypeSelection}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="PersonalDetails"
                component={PersonalDetails}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="AddressDetails"
                component={AddressDetails}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="LoginInfo"
                component={LoginInfo}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="PasswordCreation"
                component={PasswordCreation}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="IDUpload"
                component={IDUpload}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Success"
                component={Success}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Forgot"
                component={ForgotPassword}
                options={{headerShown: false}}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </FCMTokenProvider>
  );
}
