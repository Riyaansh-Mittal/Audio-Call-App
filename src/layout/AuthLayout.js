import React from 'react';
import {Image, View} from 'react-native';

import {globalStyles} from '../theme/globalStyles';

const AuthLayout = ({children}) => {
  return (
    <View style={globalStyles.container}>
      <Image
        source={require('../assets/qr.png')}
        style={globalStyles.logo}
      />
      {children}
    </View>
  );
};

export default AuthLayout;
