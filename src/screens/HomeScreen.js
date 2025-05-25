import React, {useEffect, useState} from 'react';
import {
  Button,
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';
import ZegoUIKitPrebuiltCallService, {
  ZegoSendCallInvitationButton,
} from '@zegocloud/zego-uikit-prebuilt-call-rn';
import firestore from '@react-native-firebase/firestore';
import useAuth from '../store/useAuth';
import {globalStyles} from '../theme/globalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import KeyCenter from '../config/keyCenter';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';

export default function HomeScreen({navigation}) {
  const user = useAuth(state => state.user);
  const setUser = useAuth(state => state.setUser);
  const [contacts, setContacts] = useState([]);
  const [isZegoInitialized, setIsZegoInitialized] = useState(false);

  useEffect(() => {
    if (user) {
      initService();
      getUsers();
    }
  }, [user]);

  const initService = async () => {
    try {
      await messaging().registerDeviceForRemoteMessages();
      await ZegoUIKitPrebuiltCallService.init(
        KeyCenter.appID,
        KeyCenter.appSign,
        user.id,
        user.username,
        [ZIM, ZPNs],
        {
          ringtoneConfig: {
            incomingCallFileName: 'zego_incoming.mp3',
            outgoingCallFileName: 'zego_outgoing.mp3',
          },
          notifyWhenAppRunningInBackgroundOrQuit: true,
          androidNotificationConfig: {
            channelID: 'zego_audio_call',
            channelName: 'zego_audio_call',
            sound: 'zego_incoming', // without ".mp3"
            importance: 'max', // Ensure HIGH importance so it wakes device
            visibility: 'public', // Show full notification on lock screen
            vibrationPattern: [500, 500], // Optional: vibration
          },
          onIncomingCallDeclineButtonPressed: navigation => {
            console.log('[onIncomingCallDeclineButtonPressed]');
          },
          onIncomingCallAcceptButtonPressed: navigation => {
            console.log('[onIncomingCallAcceptButtonPressed]');
          },
          onOutgoingCallCancelButtonPressed: (
            navigation,
            callID,
            invitees,
            type,
          ) => {
            console.log(
              '[onOutgoingCallCancelButtonPressed]+++',
              navigation,
              callID,
              invitees,
              type,
            );
          },
          onIncomingCallReceived: (
            callID,
            inviter,
            type,
            invitees,
            customData,
          ) => {
            console.log(
              '[Incoming call]+++',
              callID,
              inviter,
              type,
              invitees,
              customData,
            );
          },
          onIncomingCallCanceled: (callID, inviter) => {
            console.log('[onIncomingCallCanceled]+++', callID, inviter);
          },
          onIncomingCallTimeout: (callID, inviter) => {
            console.log('[onIncomingCallTimeout]+++', callID, inviter);
          },
          onOutgoingCallAccepted: (callID, invitee) => {
            console.log('[onOutgoingCallAccepted]+++', callID, invitee);
          },
          onOutgoingCallRejectedCauseBusy: (callID, invitee) => {
            Toast.show({
              type: 'busy',
              text1: 'User Busy',
              text2: `${invitee.userName} is currently on another call.`,
            });
          },
          onOutgoingCallDeclined: (callID, invitee) => {
            Toast.show({
              type: 'declined',
              text1: 'Call Declined',
              text2: `${invitee.userName} declined your call.`,
            });
          },
          onOutgoingCallTimeout: (callID, invitees) => {
            Toast.show({
              type: 'timeout',
              text1: 'No Response',
              text2: 'No one responded to your call.',
            });
          },
          requireConfig: data => {
            return {
              turnOnMicrophoneWhenJoining: true, // ✅ Moved outside onHangUp
              onHangUp: duration => {
                navigation.reset({
                  index: 0,
                  routes: [{name: 'Home'}],
                });
              },
            };
          },
          callInvitationConfig: {
            notifyWhenAppRunningInBackgroundOrQuit: true,
            androidNotificationConfig: {
              channelID: 'zego_audio_call',
              channelName: 'zego_audio_call',
              sound: 'zego_incoming',
            },
          },
        },
      );

      // 👇 Request overlay permission for offline call
      await ZegoUIKitPrebuiltCallService.requestSystemAlertWindow({
        message:
          'We need your consent for the following permissions to use offline call properly',
        allow: 'Allow',
        deny: 'Deny',
      });

      ZPNs.ZPNs.setPushConfig({enableFCMPush: true});
      await ZPNs.ZPNs.getInstance().registerPush();
      console.log('✅ registerPush() called');

      ZPNs.ZPNs.getInstance().on('registered', message => {
        console.log(
          '[ZPNs] Full registration message:',
          JSON.stringify(message),
        );
      });

      ZPNs.ZPNs.getInstance().on('registered', message => {
        console.log('[ZPNs] Registered - pushID:', message.pushID);
        if (message.errorCode !== 0) {
          console.error(
            '[ZPNs] Registration failed, error code:',
            message.errorCode,
          );
        }
      });

      setIsZegoInitialized(true); // ✅ important!

      console.log('Zego service initialized successfully');
    } catch (error) {
      console.error('Zego service initialization failed: ', error);
    }
  };

  const getUsers = async () => {
    try {
      const userDocs = await firestore()
        .collection('users')
        .where('email', '!=', user.email)
        .get();

      const users = [];
      userDocs.forEach(doc => {
        users.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setContacts(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const logout = async () => {
    try {
      // Properly uninitialize Zego services
      await ZegoUIKitPrebuiltCallService.uninit(); // Uninitialize prebuilt service

      // Clear user info
      setUser(null);
      await AsyncStorage.removeItem('user');

      // Navigate to Auth screen
      navigation.reset({
        index: 0,
        routes: [{name: 'Auth'}],
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  ZPNs.ZPNs.getInstance().on('registered', message => {
    console.log('[ZPNs] Full registration message:', JSON.stringify(message));
  });

  return (
    <View style={globalStyles.container}>
      {/* {<ZegoCallInvitationDialog />} */}
      <FlatList
        data={contacts}
        renderItem={({item}) => (
          <View style={styles.contact}>
            <Text style={styles.username}>{item.username}</Text>
            <View style={styles.actionBtns}>
              {isZegoInitialized && (
                <ZegoSendCallInvitationButton
                  invitees={[{userID: item.id, userName: item.username}]}
                  isVideoCall={false}
                  resourceID={'zego_data'}
                />
              )}
            </View>
          </View>
        )}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatlistContainer}
      />
      <TouchableOpacity onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const {width} = Dimensions.get('screen');

const styles = StyleSheet.create({
  actionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contact: {
    width: '100%',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flatlistContainer: {
    width: width,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 20,
  },
});