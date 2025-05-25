import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ZegoUIKitPrebuiltCallWaitingScreen, ZegoUIKitPrebuiltCallInCallScreen} from '@zegocloud/zego-uikit-prebuilt-call-rn';
import HomeScreen from '../screens/HomeScreen';
import { colors } from '../theme/colors';

const NativeStack = createNativeStackNavigator();

const MainNavigator = () => {
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
      <NativeStack.Screen name="Home" component={HomeScreen} />
      <NativeStack.Screen
        options={{hedaerShown: false}}
        name="ZegoUIKitPrebuiltCallWaitingScreen"
        component={ZegoUIKitPrebuiltCallWaitingScreen}
      />
      <NativeStack.Screen
        options={{hedaerShown: false}}
        name="ZegoUIKitPrebuiltCallInCallScreen"
        component={ZegoUIKitPrebuiltCallInCallScreen}
      />
    </NativeStack.Navigator>
  );
};

export default MainNavigator;
