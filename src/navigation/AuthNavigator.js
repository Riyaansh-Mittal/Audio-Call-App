import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import {colors} from '../theme/colors';

const NativeStack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <NativeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTitleStyle: {
          color: colors.white,
        },
      }}>
      <NativeStack.Screen name="Login" component={LoginScreen} />
      <NativeStack.Screen name="Register" component={RegisterScreen} />
    </NativeStack.Navigator>
  );
};

export default AuthNavigator;
