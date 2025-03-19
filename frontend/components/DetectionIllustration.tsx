import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {Icon} from '@rneui/themed';
import theme from './Theme';

export default function DetectionIllustration() {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer]}>
        <Icon name="visibility" type="material" size={20} color={'#fffff'} />
        <Text style={[styles.label]}>Detecting</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    right: 0,
    left: 0,
    top: 0,
    display: 'flex',
    alignItems: 'center',
  },
  iconContainer: {
    width: 180,
    backgroundColor: theme.lightColors?.success,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingVertical: 5,
    gap: 10,
  },
  label: {
    color: '#fffff',
  },
});
