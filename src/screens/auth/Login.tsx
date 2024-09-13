import React, {useState} from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TouchableOpacity,
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

interface RouterProps {
  navigation: NavigationProp<any, any>;
}
var width = Dimensions.get('window').width; //full width

const Login = ({navigation}: RouterProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [suffixIcon, setSuffixIcon] = useState('eye');
  const [obscure, setObscure] = useState(true);

  const auth = FIREBASE_AUTH;

  const handleChildClick = () => {
    setObscure(!obscure);
    setSuffixIcon(obscure ? 'eye-slash' : 'eye');
  };

  const signIn = async () => {
    try {
      const response = await auth.signInWithEmailAndPassword(email, password);
      console.log(response);
    } catch (error: any) {
      showAlert('Sign in failed', error.message || 'An error occurred');
    }
  };

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

  // Validation checks
  const isEmailValid = email.includes('@');
  const isPasswordValid = password.length >= 6;

  return (
    <View style={loginScreenStyles.container}>
      <View style={loginScreenStyles.topCircle} />
      <View style={loginScreenStyles.bottomCircle} />
      <View style={loginScreenStyles.bottom} />
      <Text style={styles.largeHeading}>Login</Text>
      <KeyboardAvoidingView
        style={loginScreenStyles.inputContainer}
        behavior="padding">
        {/* Email Field */}
        <DynamicTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          prefixIcon="envelope"
          isRequired
          isValid={isEmailValid}
          errorMessage="Invalid email"
        />

        {/* Password Field */}
        <DynamicTextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          keyboardType="default"
          secureTextEntry={obscure}
          prefixIcon="lock"
          suffixIcon={suffixIcon}
          suffixOnClick={handleChildClick}
          isRequired
          isValid={isPasswordValid}
          errorMessage="Password must be at least 6 characters"
        />
        <View style={loginScreenStyles.textButtonContainer}>
          <TextButton
            title="Forgot Password?"
            onPress={() => navigation.navigate('Forgot')}
          />
          <TextButton
            title="Create Account"
            onPress={() => navigation.navigate('Create')}
          />
        </View>
        <DynamicButton
          title="Login"
          onPress={signIn}
          disabled={!isEmailValid || !isPasswordValid}
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
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;

const loginScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 48,
    gap: 1.25,
    backgroundColor: Colors.white,
  },
  topCircle: {
    position: 'absolute',
    top: -450,
    left: -100,
    width: 600,
    height: 600,
    aspectRatio: 1,
    backgroundColor: Colors.primary,
    borderRadius: 600,
  },
  bottomCircle: {
    position: 'absolute',
    bottom: 50,
    left: -100,
    width: 600,
    height: 600,
    aspectRatio: 1,
    backgroundColor: Colors.white,
    borderRadius: 600,
    zIndex: 2,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    height: 200,
    backgroundColor: Colors.primary,
    flex: 1,
    width: width,
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
