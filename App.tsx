import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import {ZegoCallInvitationDialog} from '@zegocloud/zego-uikit-prebuilt-call-rn';
import Toast from 'react-native-toast-message';
import toastConfig from './src/config/toastConfig';

function App(): JSX.Element {
  return (
    <>
      <NavigationContainer>
        <ZegoCallInvitationDialog />
        <RootNavigator />
      </NavigationContainer>
      <Toast config={toastConfig} />
    </>
  );
}

export default App;
