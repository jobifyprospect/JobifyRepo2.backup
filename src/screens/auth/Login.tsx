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
import {styles} from '../../styles/globals';
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

  const auth = FIREBASE_AUTH;
  // Refs for inputs
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
    try {
      const response = await auth.signInWithEmailAndPassword(email, password);
      console.log(response);
    } catch (error: any) {
      showAlert('Sign in failed', error.message || 'An error occurred');
    }
  };

  // Sign-in function
  // const handleSignIn = async () => {
  //   try {
  //     // Sign in user with Firebase Authentication
  //     const userCredential = await auth.signInWithEmailAndPassword(
  //       email,
  //       password,
  //     );

  //     // Get the current user's uid
  //     const userId = userCredential.user.uid;

  //     // Fetch the user's role from Firestore
  //     const userDoc = await FIRESTORE_DB.collection('users').doc(userId).get();

  //     if (userDoc.exists) {
  //       const userData = userDoc.data();
  //       const userRole = userData?.role; // Assuming "role" is a field in your "users" collection

  //       // Navigate based on the user's role
  //       if (userRole === 'worker') {
  //         navigation.navigate('WorkerDashboard');
  //       } else if (userRole === 'client') {
  //         navigation.navigate('ClientDashboard');
  //       } else {
  //         console.error('Role not recognized');
  //       }
  //     } else {
  //       console.error('User document does not exist in Firestore');
  //     }
  //   } catch (error) {
  //     console.error('Sign-in error:', error);
  //   }
  // };
  // const signUp = async () => {
  //   try {
  //     const response = await auth.createUserWithEmailAndPassword(
  //       email,
  //       password,
  //     );
  //     console.log(response);
  //   } catch (error: any) {
  //     showAlert(
  //       'Account creation failed',
  //       error.message || 'An error occurred',
  //     );
  //   }
  // };

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
              // isValid={isEmailValid(email)}
              // errorMessage="Invalid email"
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
              // isValid={isPasswordValid(password) ?? true}
              returnKeyType="done"
              onSubmitEditing={() => {
                if (isEmailValid(email) || isPasswordValid(password)) {
                  buttonRef.current?.triggerPress();
                }
              }}
              // errorMessage="Password must be at least 6 characters"
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
            disabled={!isEmailValid(email) || !isPasswordValid(password)}
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
