import {View, Text, Keyboard, TouchableWithoutFeedback} from 'react-native';
import React, {useState} from 'react';
import {styles} from '../../../styles/Globals';
import DynamicTextInput from '../../../components/DynamicTextInput';
import {RootStackParamList} from '../../interfaces/RouterStackInterfaceParams';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import DynamicButton from '../../../components/DynamicButton';
import {isEmailValid} from '../../../utils/Utils';
import Background from '../../../components/Background';

type LoginInfoProps = NativeStackScreenProps<RootStackParamList, 'LoginInfo'>;

const LoginInfo = ({navigation, route}: LoginInfoProps) => {
  const {userType, firstName, lastName, phoneNumber, address} = route.params;
  const [email, setEmail] = useState('');

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Background />
        <View style={styles.elevate}>
          <View style={styles.headerContainer}>
            <Text style={styles.largeHeading}>Login Information</Text>
          </View>
          <DynamicTextInput
            label="Email"
            value={email}
            prefixIcon="envelope"
            onChangeText={setEmail}
            placeholder="example@example.com"
            keyboardType="email-address"
            isRequired
            isValid={isEmailValid(email)}
            errorMessage="Invalid email"
          />
          <View style={styles.bottomContainer}>
            <DynamicButton
              title="Next"
              onPress={() => {
                Keyboard.dismiss();
                navigation.navigate('PasswordCreation', {
                  userType,
                  firstName,
                  lastName,
                  phoneNumber,
                  address,
                  email,
                });
              }}
              type="primary"
              disabled={!isEmailValid(email)}
            />
            <DynamicButton
              title="Back"
              onPress={() => {
                Keyboard.dismiss();
                navigation.goBack();
              }}
              type="secondary"
            />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginInfo;
