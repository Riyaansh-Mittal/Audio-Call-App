import React, { useEffect } from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {globalStyles} from '../theme/globalStyles';
import {colors} from '../theme/colors';
import useAuth from '../store/useAuth';

const CheckCredentialsScreen = ({navigation}) => {
  const setUser = useAuth(state => state.setUser);

  useEffect(() => {
    (async () => {
      const userString = await AsyncStorage.getItem('user');

      if (userString) {
        setUser(JSON.parse(userString));

        navigation.reset({
          index: 0,
          routes: [{name: 'Main'}],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{name: 'Auth'}],
        });
      }
    })();
  }, []);
  return (
    <View style={globalStyles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

export default CheckCredentialsScreen;
