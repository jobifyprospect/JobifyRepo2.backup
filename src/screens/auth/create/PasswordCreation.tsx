import {
  View,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import React, {useState, useCallback, useRef} from 'react';
import {styles} from '../../../styles/Globals';
import DynamicTextInput from '../../../components/DynamicTextInput';
import {RootStackParamList} from '../../interfaces/RouterStackInterfaceParams';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {validatePassword} from '../../../utils/Utils';
import DynamicButton from '../../../components/DynamicButton';
import Background from '../../../components/Background';

type PasswordCreationProps = NativeStackScreenProps<
  RootStackParamList,
  'PasswordCreation'
>;

const PasswordCreation = ({navigation, route}: PasswordCreationProps) => {
  const {userType, firstName, lastName, phoneNumber, address, email} =
    route.params;

  const [password, setPassword] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(true);
  const [suffixIcon, setSuffixIcon] = useState('eye');
  const [obscure, setObscure] = useState(true);

  const [suffixIcon2, setSuffixIcon2] = useState('eye');
  const [obscure2, setObscure2] = useState(true);
  const passwordConfirmInputRef = useRef<TextInput>(null);

  const handleChildClick = () => {
    setObscure(!obscure);
    setSuffixIcon(obscure ? 'eye-slash' : 'eye');
  };
  const handleChildClick2 = () => {
    setObscure2(!obscure2);
    setSuffixIcon2(obscure2 ? 'eye-slash' : 'eye');
  };
  const handlePasswordChange = useCallback(
    (newPassword: string) => {
      setPassword(newPassword);
      setIsPasswordValid(validatePassword(newPassword));
      setPasswordConfirmation('');
      if (obscure2 === false) {
        setObscure2(true);
      }
    },
    [obscure2],
  );

  const handlePasswordConfirmationChange = useCallback(
    (newConfirmation: string) => {
      setPasswordConfirmation(newConfirmation);
    },
    [],
  );

  const isFormValid = () => {
    return (
      isPasswordValid &&
      password === passwordConfirmation &&
      password.length > 0 &&
      passwordConfirmation.length > 0
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Background />
        <View style={styles.elevate}>
          <View style={styles.headerContainer}>
            <Text style={styles.largeHeading}>Create your password</Text>
          </View>
          <DynamicTextInput
            label="Password"
            value={password}
            onChangeText={handlePasswordChange}
            placeholder="Enter Password"
            secureTextEntry={obscure}
            isRequired
            isValid={isPasswordValid}
            returnKeyType="next"
            onSubmitEditing={() => {
              passwordConfirmInputRef.current?.focus();
            }}
            prefixIcon="lock"
            suffixIcon={suffixIcon}
            suffixOnClick={handleChildClick}
          />
          <DynamicTextInput
            ref={passwordConfirmInputRef}
            label="Confirm Password"
            value={passwordConfirmation}
            onChangeText={handlePasswordConfirmationChange}
            placeholder="Confirm Password"
            secureTextEntry={obscure2}
            isRequired
            isValid={password === passwordConfirmation}
            prefixIcon="lock"
            suffixIcon={suffixIcon2}
            suffixOnClick={handleChildClick2}
          />
          {!isPasswordValid && (
            <Text style={styles.errorText}>
              Password must be at least 6 characters long and include one
              uppercase letter, one lowercase letter, one number, and one
              special character.
            </Text>
          )}
          {password !== passwordConfirmation && passwordConfirmation !== '' && (
            <Text style={styles.errorText}>Passwords do not match.</Text>
          )}
          <View style={styles.bottomContainer}>
            <DynamicButton
              title="Next"
              onPress={() => {
                Keyboard.dismiss();
                if (obscure === false) {
                  setObscure(true);
                }
                if (obscure2 === false) {
                  setObscure2(true);
                }
                navigation.navigate('FilesUpload', {
                  userType,
                  firstName,
                  lastName,
                  phoneNumber,
                  address,
                  email,
                  password,
                });
              }}
              type="primary"
              disabled={!isFormValid()}
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

export default PasswordCreation;
