import React, {useRef, useState} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {FIREBASE_AUTH} from '../../config/firebase';
import {showAlert} from '../../components/AlertDialog';
import DynamicTextInput from '../../components/DynamicTextInput';
import DynamicButton from '../../components/DynamicButton';
import TextButton from '../../components/TextButton';
import {NavigationProp} from '@react-navigation/native';
import {styles} from '../../styles/Globals';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faFacebookF, faGoogle} from '@fortawesome/free-brands-svg-icons';
import Colors from '../../styles/Colors';
import Background from '../../components/Background';
import {isEmailValid, isPasswordValid} from '../../utils/Utils';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Login = ({navigation}: RouterProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [suffixIcon, setSuffixIcon] = useState('eye');
  const [obscure, setObscure] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const auth = FIREBASE_AUTH;
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const buttonRef = useRef<{triggerPress: () => void}>(null);

  const handleChildClick = () => {
    setObscure(!obscure);
    setSuffixIcon(obscure ? 'eye-slash' : 'eye');
  };

  const resetForm = () => {
    emailInputRef.current?.focus();
    setEmail('');
    emailInputRef.current?.clear();

    passwordInputRef.current?.focus();
    setPassword('');
    emailInputRef.current?.clear();
  };
  const signIn = async () => {
    Keyboard.dismiss();
    if (obscure === false) {
      handleChildClick();
    }
    setIsSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await auth.signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      showAlert('Sign in failed', error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={loginScreenStyles.container}>
        <Background />
        <Text style={styles.largeHeading}>Login</Text>
        <View style={loginScreenStyles.inputContainer}>
          <KeyboardAvoidingView behavior="padding">
            {/* Email Field */}
            <DynamicTextInput
              label="Email"
              ref={emailInputRef}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              returnKeyType="next"
              onSubmitEditing={() => {
                passwordInputRef.current?.focus();
              }}
              prefixIcon="envelope"
              isRequired
            />
          </KeyboardAvoidingView>
          <KeyboardAvoidingView behavior="padding">
            {/* Password Field */}
            <DynamicTextInput
              label="Password"
              ref={passwordInputRef}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              keyboardType="default"
              secureTextEntry={obscure}
              prefixIcon="lock"
              suffixIcon={suffixIcon}
              suffixOnClick={handleChildClick}
              isRequired
              returnKeyType="done"
              onSubmitEditing={() => {
                if (isEmailValid(email) || isPasswordValid(password)) {
                  buttonRef.current?.triggerPress();
                }
              }}
            />
          </KeyboardAvoidingView>
        </View>
        <View style={loginScreenStyles.elevate}>
          <View style={loginScreenStyles.textButtonContainer}>
            <TextButton
              title="Forgot Password?"
              onPress={() => {
                Keyboard.dismiss();
                resetForm();
                navigation.navigate('Forgot');
              }}
            />
            <TextButton
              title="Create Account"
              onPress={() => {
                Keyboard.dismiss();
                resetForm();
                navigation.navigate('UserTypeSelection');
              }}
            />
          </View>
          <DynamicButton
            ref={buttonRef}
            title="Login"
            onPress={signIn}
            disabled={
              isSubmitting || !isEmailValid(email) || !isPasswordValid(password)
            }
            type="primary"
          />
          <View style={loginScreenStyles.subContainer}>
            <Text style={styles.smallText}>or Connect With</Text>
            <View style={loginScreenStyles.logoContainer}>
              <TouchableOpacity
                style={loginScreenStyles.iconButton}
                onPress={() => {}}>
                <FontAwesomeIcon
                  icon={faGoogle}
                  size={20}
                  color={Colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={loginScreenStyles.iconButton}
                onPress={() => {}}>
                <FontAwesomeIcon
                  icon={faFacebookF}
                  size={20}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const loginScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 48,
    gap: 1.25,
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  elevate: {
    zIndex: 3,
  },
  inputContainer: {
    paddingTop: 20,
    zIndex: 3,
  },
  subContainer: {
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  textButtonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    borderColor: Colors.placeholder,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.white,
  },
});

export default Login;
