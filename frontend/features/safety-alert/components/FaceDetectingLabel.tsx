import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Icon} from '@rneui/themed';
import {useFaceDetectionContext} from '@/contexts/FaceDetectionProvider';

export const FaceDetectingLabel = () => {
  const {alertStatus} = useFaceDetectionContext();
  return (
    <View style={styles.faceDetectingContainer}>
      <View
        style={[
          styles.faceDetectingLabel,
          {backgroundColor: alertStatus ? '#FF4B4B' : 'lightgreen'},
        ]}>
        <Icon name="visibility" color="black" size={16} />
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
    paddingVertical: 2,
  },
  faceDetectingText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
