import React, {useCallback, useRef, useState} from 'react';
import {
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {showAlert} from '../../components/AlertDialog';
import DynamicButton from '../../components/DynamicButton';
import DynamicTextInput from '../../components/DynamicTextInput';
import {
  FIREBASE_AUTH,
  FIREBASE_AUTH_EMAIL_PROVIDER,
} from '../../config/firebase';
import {styles} from '../../styles/Globals';
import {validatePassword} from '../../utils/Utils';
import {NavigationProp} from '@react-navigation/native';
import Colors from '../../styles/Colors';
import BackButton from '../../components/BackButton';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const ChangePassword = ({navigation}: RouterProps) => {
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [obscureCurrent, setObscureCurrent] = useState<boolean>(true);
  const [obscureNew, setObscureNew] = useState<boolean>(true);
  const [obscureConfirm, setObscureConfirm] = useState<boolean>(true);
  const [suffixIconNew, setSuffixIconNew] = useState('eye');
  const [suffixIconCurrent, setSuffixIconCurrent] = useState('eye');
  const [suffixIconConfirm, setSuffixIconConfirm] = useState('eye');

  const newPasswordInputRef = useRef<TextInput>(null);
  const passwordConfirmInputRef = useRef<TextInput>(null);
  const buttonRef = useRef<{triggerPress: () => void}>(null);

  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(true);
  const [isPasswordValid2, setIsPasswordValid2] = useState<boolean>(true);

  const handleChildClick = () => {
    setObscureCurrent(!obscureCurrent);
    setSuffixIconCurrent(obscureCurrent ? 'eye-slash' : 'eye');
  };
  const handleChildClick2 = () => {
    setObscureNew(!obscureNew);
    setSuffixIconNew(obscureNew ? 'eye-slash' : 'eye');
  };
  const handleChildClick3 = () => {
    setObscureConfirm(!obscureConfirm);
    setSuffixIconConfirm(obscureConfirm ? 'eye-slash' : 'eye');
  };

  const handleChangePassword = async () => {
    setObscureCurrent(true);
    setSuffixIconCurrent(obscureCurrent ? 'eye-slash' : 'eye');
    setObscureNew(true);
    setSuffixIconNew(obscureNew ? 'eye-slash' : 'eye');
    setObscureConfirm(true);
    setSuffixIconConfirm(obscureConfirm ? 'eye-slash' : 'eye');

    try {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        // Re-authenticate user with current password before changing password
        await user.reauthenticateWithCredential(
          FIREBASE_AUTH_EMAIL_PROVIDER.credential(
            user.email || '',
            currentPassword,
          ),
        );

        // // Change password
        await user.updatePassword(newPassword);
        showAlert('Success', 'Password changed successfully.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showAlert(
        'Error',
        'Failed to change password. Please check your current password and try again.',
      );
    }
  };

  const handleCurrenPasswordChange = useCallback(
    (_currentPassword: string) => {
      setCurrentPassword(_currentPassword);
      setIsPasswordValid2(validatePassword(currentPassword));
    },
    [currentPassword],
  );

  const handlePasswordChange = useCallback(
    (updatedPassword: string) => {
      setNewPassword(updatedPassword);
      setIsPasswordValid(validatePassword(updatedPassword));
      setPasswordConfirmation('');
      setObscureConfirm(true);
      setSuffixIconConfirm(obscureConfirm ? 'eye-slash' : 'eye');
    },
    [obscureConfirm],
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
      isPasswordValid2 &&
      newPassword.length > 0 &&
      passwordConfirmation.length > 0 &&
      newPassword === passwordConfirmation
    );
  };
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={localStyles.container}>
        <View style={localStyles.screen}>
          <SafeAreaView style={localStyles.btnContainerEnd}>
            <View style={localStyles.btnContainerEnd}>
              <BackButton onPress={async () => navigation.goBack()} />
            </View>
          </SafeAreaView>
          <View style={localStyles.headerContainer}>
            <Text style={styles.largeHeading}>Change Password</Text>
            <View>
              <DynamicTextInput
                label="Current Password"
                value={currentPassword}
                onChangeText={handleCurrenPasswordChange}
                placeholder="Enter Current Password"
                secureTextEntry={obscureCurrent}
                isRequired
                isValid={isPasswordValid2}
                returnKeyType="next"
                onSubmitEditing={() => newPasswordInputRef.current?.focus()}
                prefixIcon="lock"
                suffixIcon={suffixIconCurrent}
                suffixOnClick={handleChildClick}
                errorMessage={'Invalid Current Password'}
              />
              <DynamicTextInput
                ref={newPasswordInputRef}
                label="New Password"
                value={newPassword}
                onChangeText={handlePasswordChange}
                placeholder="Enter New Password"
                secureTextEntry={obscureNew}
                isRequired
                isValid={isPasswordValid}
                returnKeyType="next"
                onSubmitEditing={() => passwordConfirmInputRef.current?.focus()}
                prefixIcon="lock"
                suffixIcon={suffixIconNew}
                suffixOnClick={handleChildClick2}
              />
              <DynamicTextInput
                ref={passwordConfirmInputRef}
                label="Confirm New Password"
                value={passwordConfirmation}
                onChangeText={handlePasswordConfirmationChange}
                placeholder="Confirm New Password"
                secureTextEntry={obscureConfirm}
                isRequired
                isValid={newPassword === passwordConfirmation}
                prefixIcon="lock"
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (isFormValid()) {
                    buttonRef.current?.triggerPress();
                  }
                }}
                suffixIcon={suffixIconConfirm}
                suffixOnClick={handleChildClick3}
              />
              {!isPasswordValid && (
                <Text style={styles.errorText}>
                  Password must be at least 6 characters long and include one
                  uppercase letter, one lowercase letter, one number, and one
                  special character.
                </Text>
              )}
              {newPassword !== passwordConfirmation &&
                passwordConfirmation !== '' && (
                  <Text style={styles.errorText}>Passwords do not match.</Text>
                )}
              <DynamicButton
                ref={buttonRef}
                disabled={!isFormValid()}
                title="Change Password"
                type="primary"
                onPress={() => {
                  handleChangePassword();
                  console.log('PRESSED');
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
const localStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    flex: 1,
  },
  gap: {
    height: 8,
  },
  verifiedIcon: {},
  containIcon: {
    position: 'absolute',
    bottom: 0,
    right: 4,
    width: 24,
    backgroundColor: Colors.white,
    borderRadius: 32,
  },
  containMode: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Ensure items don't overlap
    alignItems: 'center', // Align items in the center vertically
  },
  modeText: {
    flexShrink: 1, // Prevent the text from taking up full width
    color: Colors.labelText, // Use your label text color
    fontSize: 16, // Adjust font size as needed
  },
  divider: {
    height: 1,
    backgroundColor: Colors.placeholder,
    marginVertical: 16,
  },
  screen: {
    justifyContent: 'center',
    flex: 1,
    paddingTop: 25,
  },
  btnContainerEnd: {
    alignItems: 'flex-start',
  },
  headerContainer: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.placeholder,
    marginVertical: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  initialsContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.labelText,
  },
  contactDetails: {
    // gap: 8,
  },
  addressDetails: {
    gap: 8,
  },
});
export default ChangePassword;
