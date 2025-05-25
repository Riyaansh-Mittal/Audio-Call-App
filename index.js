import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn';
import ZegoUIKitSignalingPlugin from '@zegocloud/zego-uikit-signaling-plugin-rn'; // ✅ Import signaling plugin
import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';
import messaging from '@react-native-firebase/messaging';
import KeyCenter from './src/config/keyCenter';

console.log(ZIM)
// ✅ Step 1: Initialize ZIM
// ZIM.create({
//   appID: KeyCenter.appID,
//   appSign: KeyCenter.appSign,
// });

// ✅ Step 3: Enable debug logs & configure ZPNs
ZPNs.ZPNs.enableDebug(true);
ZPNs.ZPNs.setPushConfig({ enableFCMPush: true });


// ✅ Step 5: Get FCM token and register device
(async () => {
  try {
    const fcmToken = await messaging().getToken();
    console.log('📱 FCM Token1:', fcmToken);
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('📩 FCM message handled in background:', remoteMessage);
    });
  } catch (err) {
    console.error('🔥 Error initializing FCM and ZIM:', err);
  }
})();

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📩 FCM message handled in background:', remoteMessage);
});

ZegoUIKitPrebuiltCallService.useSystemCallingUI([ZIM, ZPNs]);

// ✅ Step 6: Register main app
AppRegistry.registerComponent(appName, () => App);

