import React, {useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import AuthLayout from '../layout/AuthLayout';
import {globalStyles} from '../theme/globalStyles';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Loader from '../components/Loader';
import useAuth from '../store/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuth(state => state.setUser);
  const login = async () => {
    if (email && password) {
      setLoading(true);
      try {
        // First check if user already logged in
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          navigation.reset({
            index: 0,
            routes: [{name: 'Main'}],
          });

          setLoading(false);
          return; // stop here, no need to login again
        }

        let retryCount = 0;
        const maxRetries = 3;

        const tryLogin = async () => {
          try {
            const userCredentials = await auth().signInWithEmailAndPassword(
              email,
              password,
            );
            const userData = await firestore()
              .collection('users')
              .doc(userCredentials.user.uid)
              .get();

            if (userData.exists) {
              const userObject = {
                id: userData.id,
                ...userData.data(),
              };

              setUser(userObject);
              await AsyncStorage.setItem('user', JSON.stringify(userObject));

              navigation.reset({
                index: 0,
                routes: [{name: 'Main'}],
              });
            }
          } catch (error) {
            if (
              error.code === 'firestore/unavailable' &&
              retryCount < maxRetries
            ) {
              retryCount++;
              console.log(`Retry attempt ${retryCount}...`);
              await new Promise(resolve =>
                setTimeout(resolve, 1000 * retryCount),
              );
              await tryLogin();
            } else {
              console.log(error.message);
              Alert.alert(error.message);
            }
          }
        };

        await tryLogin();
      } catch (error) {
        console.log(error.message);
        Alert.alert(error.message);
      }
      setLoading(false);
    } else {
      Alert.alert('Please fill all the fields.');
    }
  };

  return (
    <AuthLayout>
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

      <TouchableOpacity style={globalStyles.primaryButton} onPress={login}>
        <Text style={globalStyles.btnText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={globalStyles.primaryButton}
        onPress={() => navigation.navigate('Register')}>
        <Text style={globalStyles.btnText}>Register</Text>
      </TouchableOpacity>
      <Loader visible={loading} />
    </AuthLayout>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({});
