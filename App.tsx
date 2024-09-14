import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Login from './src/screens/auth/Login';
import Transaction from './src/screens/Transaction';
import Profile from './src/screens/Profile';
import {onAuthStateChanged} from '@react-native-firebase/auth';
import {FIREBASE_AUTH} from './src/config/firebase';
import {User} from '@react-native-google-signin/google-signin';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faHouse,
  faFile,
  faUser,
  faBell,
} from '@fortawesome/free-solid-svg-icons';
import {library} from '@fortawesome/fontawesome-svg-core';
import Notification from './src/screens/Notification';
import Dashboard from './src/screens/client/Dashboard';
import CreateAccount from './src/screens/auth/create/CreateAccount';
import ForgotPassword from './src/screens/auth/forgot/ForgotPassword';
import {Platform} from 'react-native';

library.add(faHouse, faFile, faUser, faBell);

const Stack = createNativeStackNavigator();
const InsideStack = createNativeStackNavigator();
const InsideLayout = () => {
  return (
    <InsideStack.Navigator>
      <InsideStack.Screen
        name="Dashboard"
        component={Dashboard}
        options={{headerShown: false}}
      />
      <InsideStack.Screen
        name="Notification"
        component={Notification}
        options={{headerShown: false}}
      />
    </InsideStack.Navigator>
  );
};

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

const TabLayout = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarActiveTintColor: '#00A1D7',
        tabBarInactiveTintColor: '#979090',
        tabBarLabelStyle: {
          fontSize: 12,
        },
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
        //TODO Fix lint issue
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
      <Tab.Screen name="Home" component={InsideLayout} />
      <Tab.Screen name="Transaction" component={Transaction} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  //TODO Role Base Access Control
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      FIREBASE_AUTH,
      (authUser: User | null) => {
        setUser(authUser);
      },
    );
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {user ? (
          <Stack.Screen
            name="Inside"
            component={TabLayout}
            options={{headerShown: false}}
          />
        ) : (
          <Stack.Screen
            name="Login"
            component={Login}
            options={{headerShown: false}}
          />
        )}
        <Stack.Screen
          name="Create"
          component={CreateAccount}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Forgot"
          component={ForgotPassword}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
