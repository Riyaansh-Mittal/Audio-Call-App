import React from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';

import { globalStyles } from '../theme/globalStyles';
import { colors } from '../theme/colors';

const Loader = ({ visible }) => {
  return (
    <Modal visible={visible} transparent>
      <View style={globalStyles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </Modal>
  );
};

export default Loader;
