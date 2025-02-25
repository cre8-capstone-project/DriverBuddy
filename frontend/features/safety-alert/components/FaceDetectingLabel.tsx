import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Icon} from '@rneui/themed';

export const FaceDetectingLabel = () => {
  return (
    <View style={styles.faceDetectingContainer}>
      <View style={styles.faceDetectingLabel}>
        <Icon name="visibility" color="black" size={14} />
        <Text style={styles.faceDetectingText}>Detecting</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  faceDetectingContainer: {
    overflow: 'hidden',
    position: 'absolute',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  faceDetectingLabel: {
    color: 'black',
    backgroundColor: 'lightgreen',
    borderEndEndRadius: 10,
    borderStartEndRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
  },
  faceDetectingText: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
