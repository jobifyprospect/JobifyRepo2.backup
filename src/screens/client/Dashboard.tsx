import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {styles} from '../../styles/Globals';
import {NavigationProp} from '@react-navigation/native';
import NotificationsButton from '../../components/NotificationsButton';
import {faPlusSquare} from '@fortawesome/free-regular-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import AddJobButton from '../../components/AddJobButton';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Dashboard = ({navigation}: RouterProps) => {
  return (
    <View style={localStyles.container}>
      <View style={localStyles.screen}>
        <View style={localStyles.btnContainerEnd}>
          <NotificationsButton
            type="primary"
            onPress={async () => navigation.navigate('Notification')}
          />
        </View>

        <View style={localStyles.headerContainer}>
          <Text style={styles.xlargeHeading}> Welcome to Jobify! </Text>

          <View>
            <Text style={[styles.mediumText, {fontWeight: '400'}]}>
              Ready to find the worker for you?
              {'\n'}
              Press the <FontAwesomeIcon icon={faPlusSquare} /> button to get
              started
            </Text>
          </View>
        </View>

        <View style={localStyles.btnContainerEnd}>
          <AddJobButton
            type="primary"
            onPress={async () => navigation.navigate('Post')}
          />
        </View>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    flex: 1,
  },
  screen: {
    justifyContent: 'center',
    flex: 1,
    paddingTop: 50,
    paddingBottom: 100,
  },
  btnContainerEnd: {
    alignItems: 'flex-end',
  },
  headerContainer: {
    flex: 1,
    paddingTop: 100,
    gap: 50,
  },
});

export default Dashboard;
