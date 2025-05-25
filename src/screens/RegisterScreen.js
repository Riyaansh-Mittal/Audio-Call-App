import React, {useState} from 'react';
import {Alert, Text, TextInput, TouchableOpacity} from 'react-native';
import AuthLayout from '../layout/AuthLayout';
import {globalStyles} from '../theme/globalStyles';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Loader from '../components/Loader';

const RegisterScreen = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const register = async () => {
    if (username && email && password) {
      setLoading(true); // Show loading state when registration starts
      try {
        const userCredentials = await auth().createUserWithEmailAndPassword(
          email,
          password,
        );

        // Store user details in Firestore after registration
        await firestore()
          .collection('users')
          .doc(userCredentials.user.uid)
          .set({
            email,
            username,
          });

        // Sign out the newly created user (this is important to avoid auto-login)
        await auth().signOut();
        setLoading(false);
        // After successful registration and logout, navigate to Login screen
        navigation.navigate('Login');
      } catch (error) {
        setLoading(false);
        Alert.alert('Registration Error', error.message); // Show error message
      }
    } else {
      Alert.alert('Validation Error', 'Please fill all the fields.');
    }
  };

  return (
    <AuthLayout>
      <TextInput
        placeholder="Username"
        style={globalStyles.input}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Email"
        style={globalStyles.input}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        style={globalStyles.input}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={globalStyles.primaryButton} onPress={register}>
        <Text style={globalStyles.btnText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={globalStyles.primaryButton}
        onPress={() => navigation.navigate('Login')}>
        <Text style={globalStyles.btnText}>Login</Text>
      </TouchableOpacity>
      <Loader visible={loading} />
    </AuthLayout>
  );
};

export default RegisterScreen;
