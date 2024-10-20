import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import Colors from '../../styles/Colors';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      {/* You can customize the color */}
      <Text style={styles.loadingText}>Loading Dashboard...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Change to your desired background color
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoadingScreen;
