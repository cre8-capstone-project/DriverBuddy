import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {Camera} from 'react-native-vision-camera-face-detector';
import Animated from 'react-native-reanimated';
import {useFaceDetection} from '@/features/safety-alert/hooks/useFaceDetection';

const CameraView = ({device}: {device: any}) => {
  const {
    faceDetectionOptions,
    handleFacesDetection,
    animatedStyle,
    leftEyeStatus,
    rightEyeStatus,
    yawAngleStatus,
  } = useFaceDetection();

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        device={device}
        isActive={true}
        faceDetectionCallback={handleFacesDetection}
        faceDetectionOptions={faceDetectionOptions}
      />
      <Animated.View style={animatedStyle} />

      {/* FOR DEBUG */}
      <View style={styles.tableContainer}>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Left Eye</Text>
          <Text style={[styles.tableCell, leftEyeStatus ? styles.closed : styles.open]}>
            {leftEyeStatus ? 'closed' : 'open'}
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Right Eye</Text>
          <Text style={[styles.tableCell, rightEyeStatus ? styles.closed : styles.open]}>
            {rightEyeStatus ? 'closed' : 'open'}
          </Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Face Direction</Text>
          <Text style={styles.tableCell}>{yawAngleStatus}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  camera: {...StyleSheet.absoluteFillObject},

  //FOR DEBUG
  tableContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    width: '80%',
    alignSelf: 'center',
    paddingVertical: 8,
  },
  tableCell: {fontSize: 16, flex: 1, textAlign: 'center'},
  open: {color: 'green'},
  closed: {color: 'red'},
});

export default CameraView;
