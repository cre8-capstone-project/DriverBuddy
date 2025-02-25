import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Icon} from '@rneui/themed';
import type {ViewMode} from '@/types/ViewMode';

type Props = {
  viewMode: ViewMode;
  isFaceDetectionActive: boolean;
};

export const FaceDetectionWindowFrame = ({viewMode, isFaceDetectionActive}: Props) => {
  return (
    <View
      style={
        viewMode === 'mapView' && isFaceDetectionActive ? styles.cameraWindowBorder : styles.hidden
      }>
      <View style={styles.cameraWindowLabel}>
        <Icon name="visibility" color="black" size={10 / 0.2} />
        <Text style={styles.cameraWindowText}>Detecting</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  hidden: {display: 'none'},
  cameraWindowBorder: {
    overflow: 'hidden',
    position: 'absolute',
    borderRadius: 60,
    width: '100%',
    height: '100%',
    zIndex: 2,
    borderColor: 'lightgreen',
    borderWidth: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  cameraWindowLabel: {
    color: 'black',
    backgroundColor: 'lightgreen',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    justifyContent: 'center',
  },
  cameraWindowText: {
    color: 'black',
    fontSize: 10 / 0.2,
    height: '100%',
    fontWeight: 'bold',
  },
});
