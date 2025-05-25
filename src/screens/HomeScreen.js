import React, {useEffect, useState} from 'react';
import {
  Button,
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Text,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';
import ZegoUIKitPrebuiltCallService, {
  ZegoSendCallInvitationButton,
} from '@zegocloud/zego-uikit-prebuilt-call-rn';
import firestore from '@react-native-firebase/firestore';
import useAuth from '../store/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import KeyCenter from '../config/keyCenter';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';

const {width, height} = Dimensions.get('window');

export default function HomeScreen({navigation}) {
  const user = useAuth(state => state.user);
  const setUser = useAuth(state => state.setUser);
  const [contacts, setContacts] = useState([]);
  const [isZegoInitialized, setIsZegoInitialized] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await getUsers();
    setRefreshing(false);
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

  const renderContact = ({item, index}) => (
    <View style={[styles.contactCard, {marginTop: index === 0 ? 0 : 12}]}>
      <View style={styles.contactInfo}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.onlineIndicator} />
        </View>
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>{item.username}</Text>
          <Text style={styles.contactStatus}>Available</Text>
        </View>
      </View>
      <View style={styles.actionContainer}>
        {isZegoInitialized && (
          <View style={styles.callButtonWrapper}>
            <ZegoSendCallInvitationButton
              invitees={[{userID: item.id, userName: item.username}]}
              isVideoCall={false}
              resourceID={'zego_data'}
            />
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>👥</Text>
      </View>
      <Text style={styles.emptyTitle}>No Contacts Found</Text>
      <Text style={styles.emptyMessage}>
        Pull down to refresh and find people to call
      </Text>
    </View>
  );

  ZPNs.ZPNs.getInstance().on('registered', message => {
    console.log('[ZPNs] Full registration message:', JSON.stringify(message));
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{user?.username || 'User'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contacts Section */}
      <View style={styles.contactsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Contacts</Text>
          <Text style={styles.contactCount}>
            {contacts.length} {contacts.length === 1 ? 'person' : 'people'}
          </Text>
        </View>

        <FlatList
          data={contacts}
          renderItem={renderContact}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.contactsList,
            contacts.length === 0 && styles.emptyListContainer
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#DC00FF']}
              tintColor="#DC00FF"
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  logoutButton: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  contactsSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  contactCount: {
    fontSize: 14,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  contactsList: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DC00FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  contactStatus: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
  },
  actionContainer: {
    marginLeft: 12,
  },
  callButtonWrapper: {
    // Wrapper for the Zego call button to ensure proper styling
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});