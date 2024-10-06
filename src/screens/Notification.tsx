import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import BackButton from '../components/BackButton';
import {NavigationProp} from '@react-navigation/native';
import {styles} from '../styles/Globals';
import {SafeAreaView} from 'react-native-safe-area-context';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Notification = ({navigation}: RouterProps) => {
  return (
    <View style={localStyles.container}>
      <View style={localStyles.screen}>
        <SafeAreaView style={localStyles.btnContainerBetween}>
          <BackButton onPress={async () => navigation.goBack()} />
          {/* <DynamicButton title='' type='primary' onPress={async () => navigation.navigate('Notification')} /> */}
        </SafeAreaView>

        <View style={localStyles.headerContainer}>
          <Text style={styles.largeHeading}>Notifications</Text>
        </View>

        <View style={localStyles.mainContent} />
        <View style={localStyles.mainContent} />
      </View>
    </View>
  );
};

export default Notification;

const localStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    flex: 1,
  },
  screen: {
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 25,
  },
  btnContainerEnd: {
    alignItems: 'flex-end',
  },
  btnContainerBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerContainer: {},
  mainContent: {
    flex: 1,
    gap: 15,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
});
