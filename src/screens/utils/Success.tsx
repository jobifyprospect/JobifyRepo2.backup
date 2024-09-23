import {View, Text, Button, StyleSheet} from 'react-native';
import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../interfaces/RouterStackInterfaceParams';

type SuccessProps = NativeStackScreenProps<RootStackParamList, 'Success'>;

const Success = ({navigation, route}: SuccessProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Created Successfully!</Text>
      <Text style={styles.message}>
        Your account has been created successfully. You can now log in and start
        using the app.
      </Text>
      <Button
        title="Go to Login"
        onPress={() => navigation.navigate('Login')} // Replace with your actual login screen name
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default Success;
