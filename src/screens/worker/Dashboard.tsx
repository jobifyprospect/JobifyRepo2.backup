import {View, Text, Button} from 'react-native';
import React from 'react';
import {styles} from '../../styles/Globals';
import {NavigationProp} from '@react-navigation/native';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Dashboard = ({navigation}: RouterProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.contentText}>Worker</Text>
      <Button
        onPress={() => navigation.navigate('Notification')}
        title="Notification"
      />
    </View>
  );
};

export default Dashboard;
