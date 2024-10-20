// SplashScreen.tsx
import React, {useEffect} from 'react';
import {View, StyleSheet, ActivityIndicator, StatusBar} from 'react-native';
import Colors from '../styles/Colors';

const SplashScreen = ({onNavigate}: {onNavigate: () => void}) => {
  // Automatically navigate after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      onNavigate();
    }, 3000); // Set delay time (3000ms = 3 seconds)

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, [onNavigate]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ActivityIndicator size="large" color={Colors.white} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2196F3', // Blue background color
  },
  title: {
    fontSize: 24,
    color: '#fff', // White text color
  },
});

export default SplashScreen;
