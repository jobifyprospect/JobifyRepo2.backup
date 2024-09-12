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
  // Function to handle the event emitted from the child component
  const handleChildClick = () => {
    if (obscure) {
      setSuffixIcon('eye-slash');
    } else {
      setSuffixIcon('eye');
    }
    setObscure(!obscure);
  };
  const signIn = async () => {
    setLoading(true);
    try {
      const response = await auth.signInWithEmailAndPassword(email, password);
      console.log(response);
    } catch (error: any) {
      // console.log(error);
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
      // console.log(error);
      showAlert(
        'Account creation failed',
        error.message || 'An error occurred',
      );
    } finally {
      setLoading(false);
    }
  };

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
          isValid={email.includes('@')}
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
          isValid={password.length >= 6}
          errorMessage="Password must be at least 6 characters"
        />
        {loading ? (
          <ActivityIndicator size={'large'} color={'#0000ff'} />
        ) : (
          <>
            <Button title="Login" onPress={() => signIn()} />
            <Button title="Create Account" onPress={() => signUp()} />
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
  input: {
    marginVertical: 4,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
});
