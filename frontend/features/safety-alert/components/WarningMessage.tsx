import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

type Props = {
  isWarning: boolean;
};

export const WarningMessage = ({isWarning}: Props) => {
  return (
    isWarning && (
      <View style={styles.warningContainer}>
        <Text style={styles.warningText}>⚠️ WARNING ⚠️</Text>
      </View>
    )
  );
};

const styles = StyleSheet.create({
  warningContainer: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    // backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  warningText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
