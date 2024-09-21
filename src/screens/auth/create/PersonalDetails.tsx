import {
  View,
  Text,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {styles} from '../../../styles/Globals';

import DynamicTextInput from '../../../components/DynamicTextInput';
import {RootStackParamList} from '../../interfaces/CreateInterfaceParams';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Background from '../../../components/Background';
import DynamicButton from '../../../components/DynamicButton';
import {isNotEmpty, isValidPhoneNumber} from '../../../utils/Utils';

type PersonalDetailsProps = NativeStackScreenProps<
  RootStackParamList,
  'PersonalDetails'
>;

const PersonalDetails = ({navigation, route}: PersonalDetailsProps) => {
  const {userType} = route.params;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const lastNameInputRef = useRef<TextInput>(null);
  const phoneNumberInputRef = useRef<TextInput>(null);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Background />
        <View style={styles.elevate}>
          <View style={styles.headerContainer}>
            <Text style={styles.largeHeading}>Personal Details</Text>
          </View>
          <DynamicTextInput
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First Name"
            isRequired={true}
            prefixIcon="user"
            isValid={isNotEmpty(firstName)}
            returnKeyType="next"
            onSubmitEditing={() => {
              lastNameInputRef.current?.focus();
            }}
            autoCapitalize="sentences"
            errorMessage="First Name is less than 3"
          />
          <DynamicTextInput
            ref={lastNameInputRef}
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last Name"
            isRequired={true}
            prefixIcon="user"
            isValid={isNotEmpty(lastName)}
            returnKeyType="next"
            onSubmitEditing={() => {
              phoneNumberInputRef.current?.focus();
            }}
            autoCapitalize="sentences"
            errorMessage="Last Name is less than 3"
          />
          <DynamicTextInput
            ref={phoneNumberInputRef}
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+63 000 000 0000"
            keyboardType="phone-pad"
            isRequired={true}
            prefixIcon="mobile"
            isValid={isValidPhoneNumber(phoneNumber)}
            returnKeyType="done"
            errorMessage="Invalid Phone Number"
          />
          <View style={styles.bottomContainer}>
            <DynamicButton
              title="Next"
              onPress={() => {
                Keyboard.dismiss();
                navigation.navigate('AddressDetails', {
                  userType,
                  firstName,
                  lastName,
                  phoneNumber,
                });
              }}
              type="primary"
              disabled={
                !isNotEmpty(firstName) ||
                !isNotEmpty(lastName) ||
                !isValidPhoneNumber(phoneNumber)
              }
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

export default PersonalDetails;
