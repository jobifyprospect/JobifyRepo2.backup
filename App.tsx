import React, {useEffect, useState} from 'react';
import 'react-native-get-random-values';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Login from './src/screens/auth/Login';
import Transaction from './src/screens/Transaction';
import Profile from './src/screens/Profile';
import {onAuthStateChanged} from '@react-native-firebase/auth';
import {FIREBASE_AUTH, usersRef} from './src/config/firebase';
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
import JobDetailsClient from './src/screens/client/JobDetailsClient';
import AcceptOrDeclineApplicant from './src/screens/client/AcceptOrDeclineApplicant';
import ApplyToJob from './src/screens/worker/ApplyToJob';
import ChangePassword from './src/screens/auth/ChangePassword';
import EditUserDetails from './src/screens/EditUserDetails';
import messaging, {firebase} from '@react-native-firebase/messaging';
import {FCMTokenProvider} from './src/config/FCMTokenContext';
import WorkerReviews from './src/screens/WorkerReviews';
import MapScreen from './src/screens/MapScreen';
import WriteReviewScreen from './src/screens/client/WriteReview';
import {getIsNewUser, setIsNewUser} from './src/shared/AuthUtils';

library.add(faHouse, faFile, faUser, faBell);
enableScreens();
const DELAY_MS = 10000;
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
const Tab = createBottomTabNavigator<RootStackParamList>();

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
        initialParams={{_role: role as string}}
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
          const isNewUser = await getIsNewUser();
          // Assume you have logic to determine if it's a new account
          const delay = isNewUser ? DELAY_MS : 0;
          console.log(`isNewUser ${isNewUser}`);
          console.log(`isNewUser ${delay}`);

          setTimeout(async () => {
            try {
              setUser(authUser);
              const userDoc = await usersRef.doc(authUser.uid).get();
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
                    setIsNewUser(false);
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
          }, delay);
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
              <Stack.Screen
                name="MapScreen"
                component={MapScreen}
                options={{title: 'Map', headerShown: false}}
              />
              <Stack.Screen
                name="JobDetailsClient"
                component={JobDetailsClient}
                options={{title: 'JobDetailsClient', headerShown: false}} // Job Details, Client View Screen
              />
              <Stack.Screen
                name="AcceptOrDeclineApplicant"
                component={AcceptOrDeclineApplicant}
                options={{
                  title: 'AcceptOrDeclineApplicant',
                  headerShown: false,
                }} // View Job Applicants, Client View Screen
              />
              <Stack.Screen
                name="ApplyToJob"
                component={ApplyToJob}
                options={{title: 'ApplyToJob', headerShown: false}} // Job Application, Worker View Screen
              />
              <Stack.Screen
                name="WorkerReviews"
                component={WorkerReviews}
                options={{title: 'WorkerReviews', headerShown: false}} // Worker Reviews
              />
              <Stack.Screen
                name="WriteReview"
                component={WriteReviewScreen}
                options={{title: 'Write a Review', headerShown: false}} // Custom header title
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
