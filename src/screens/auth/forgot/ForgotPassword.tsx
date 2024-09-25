import {View, Text, Button} from 'react-native';
import React from 'react';
import {NavigationProp} from '@react-navigation/native';
import { styles } from '../../../styles/Globals';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const ForgotPassword = ({navigation}: RouterProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.contentText}>ForgotPassword</Text>
      <Button onPress={() => navigation.goBack()} title="Back" />
    </View>
  );
};

export default ForgotPassword;
