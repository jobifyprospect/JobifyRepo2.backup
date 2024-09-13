import {View, Text, Button} from 'react-native';
import React from 'react';
import {NavigationProp} from '@react-navigation/native';
import {styles} from '../../../styles/globals';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const CreateAccount = ({navigation}: RouterProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.contentText}>CreateAccount</Text>
      <Button onPress={() => navigation.goBack()} title="Back" />
    </View>
  );
};

export default CreateAccount;
