import React from 'react';
import {View, StyleSheet, Image} from 'react-native';

const alertIcon = require('@/assets/images/icon_alert.png');

type Props = {
  isAlerting: boolean;
};

export const AlertingMessage = ({isAlerting}: Props) => {
  return (
    isAlerting && (
      <View style={styles.warningContainer}>
        <Image source={alertIcon} />
      </View>
    )
  );
};

const styles = StyleSheet.create({
  warningContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: '-50%'}, {translateY: '-50%'}],
  },
  warningIcon: {
    fontSize: 150,
    color: '#D0342C',
  },
  warningText: {
    fontSize: 28,
    color: '#D0342C',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
