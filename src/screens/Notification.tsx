import { View, Text, Button, StyleSheet } from 'react-native';
import React from 'react';
import { NavigationProp } from '@react-navigation/native';
import { styles } from '../styles/Globals';
import BackButton from '../components/BackButton';
import DynamicButton from '../components/DynamicButton';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Notification = ({ navigation }: RouterProps) => {
  return (
    <View style={localStyles.container}>
      <View style={localStyles.screen}>
        <View style={localStyles.btnContainerBetween}>
          <BackButton onPress={async () => navigation.goBack()} />
          <DynamicButton title='Post' type='primary' onPress={async () => navigation.navigate('Notification')} />
        </View>

        <View style={localStyles.headerContainer}>
          <Text style={styles.xlargeHeading}> Notifications </Text>
        </View>

        <View style={localStyles.mainContent}>

        </View>
      </View>
    </View>
  );
};

export default Notification;

const localStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    flex: 1
  },
  screen: {
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 50,
  },
  btnContainerEnd: {
    alignItems: 'flex-end',
  },
  btnContainerBetween: {
    flexDirection: "row",
    justifyContent: 'space-between'
  },
  headerContainer: {
    paddingTop: 40,
    gap: 50,
  },
  mainContent: {
    flex: 1,
    gap: 15,
    paddingHorizontal: 16,
    paddingTop: 40
  }
})
