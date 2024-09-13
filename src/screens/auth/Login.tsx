import React, {useState} from 'react';
import {
  ActivityIndicator,
  Button,
  KeyboardAvoidingView,
  StyleSheet,
  View,
} from 'react-native';
import {FIREBASE_AUTH} from '../../config/firebase';
import {showAlert} from '../../components/AlertDialog';
import DynamicTextInput from '../../components/DynamicTextInput';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [suffixIcon, setSuffixIcon] = useState('eye');
  const [obscure, setObscure] = useState(true);
  const [loading, setLoading] = useState(false);

  const auth = FIREBASE_AUTH;

  const handleChildClick = () => {
    setObscure(!obscure);
    setSuffixIcon(obscure ? 'eye-slash' : 'eye');
  };

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await auth.signInWithEmailAndPassword(email, password);
      console.log(response);
    } catch (error: any) {
      showAlert('Sign in failed', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () => {
    setLoading(true);
    try {
      const response = await auth.createUserWithEmailAndPassword(
        email,
        password,
      );
      console.log(response);
    } catch (error: any) {
      showAlert(
        'Account creation failed',
        error.message || 'An error occurred',
      );
    } finally {
      setLoading(false);
    }
  };

  // Validation checks
  const isEmailValid = email.includes('@');
  const isPasswordValid = password.length >= 6;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
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

        {/* Loading Indicator or Buttons */}
        {loading ? (
          <ActivityIndicator size={'large'} color={'#0000ff'} />
        ) : (
          <>
            {/* Disable button until both inputs are valid */}
            <Button
              title="Login"
              onPress={signIn}
              disabled={!isEmailValid || !isPasswordValid}
            />
            <Button
              title="Create Account"
              onPress={signUp}
              disabled={!isEmailValid || !isPasswordValid}
            />
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
  },
});
