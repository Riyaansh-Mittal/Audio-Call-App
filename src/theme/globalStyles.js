import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const globalStyles = StyleSheet.create({
    btnText: {
      color: colors.white,
      fontWeight: 'bold',
      fontSize: 20,
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    input: {
      width: '80%',
      height: 50,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: 20,
      paddingHorizontal: 15,
      marginVertical: 10,
    },
    logo: {
      width: 150,
      height: 150,
      marginBottom: 20,
    },
    primaryButton: {
      width: '80%',
      marginTop: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 20,
      height: 50,
    },
  });
