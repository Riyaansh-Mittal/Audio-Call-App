import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ToastConfig } from 'react-native-toast-message';

const toastConfig: ToastConfig = {
  declined: ({ text1, text2 }) => (
    <View style={[styles.base, styles.declined]}>
      {/* <Ionicons name="close-circle" size={24} color="#fff" /> */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1 ?? 'Call Declined'}</Text>
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),
  busy: ({ text1, text2 }) => (
    <View style={[styles.base, styles.busy]}>
      {/* <Ionicons name="time" size={24} color="#fff" /> */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1 ?? 'User Busy'}</Text>
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),
  timeout: ({ text1, text2 }) => (
    <View style={[styles.base, styles.timeout]}>
      {/* <Ionicons name="alert-circle" size={24} color="#fff" /> */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1 ?? 'No Response'}</Text>
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 10,
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    backgroundColor: '#333',
  },
  textContainer: {
    marginLeft: 10,
    flexShrink: 1,
  },
  title: {
    fontWeight: 'bold',
    color: '#fff',
  },
  message: {
    color: '#fff',
    marginTop: 2,
  },
  declined: {
    backgroundColor: '#d9534f',
  },
  busy: {
    backgroundColor: '#f0ad4e',
  },
  timeout: {
    backgroundColor: '#5bc0de',
  },
});

export default toastConfig;
