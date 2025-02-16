import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {Camera} from 'react-native-vision-camera-face-detector';
import Animated from 'react-native-reanimated';
import {useFaceDetection} from '@/features/safety-alert/hooks/useFaceDetection';

const FaceDetection = ({device}: {device: any}) => {
  const {
    faceDetectionOptions,
    handleFacesDetection,
    faceBorderStyle,
    isWarning,
    // *** FOR DEBUG ***
    // leftEyeStatus,
    // rightEyeStatus,
    // pitchAngleStatus,
    // blinkCount,
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
      <Animated.View style={faceBorderStyle} />
      {isWarning && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>⚠️ WARNING ⚠️</Text>
        </View>
      )}

      {/* FOR DEBUG */}
      {/* <View style={styles.tableContainer}>
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
          <Text style={styles.tableCell}>Blinks/min</Text>
          <Text style={[styles.tableCell]}>{blinkCount}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Face Direction</Text>
          <Text style={styles.tableCell}>{pitchAngleStatus}</Text>
        </View>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  camera: {...StyleSheet.absoluteFillObject},
  warningContainer: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
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

  //FOR DEBUG
  // tableContainer: {
  //   position: 'absolute',
  //   bottom: 0,
  //   width: '100%',
  //   backgroundColor: '#f0f0f0',
  //   paddingVertical: 10,
  // },
  // tableRow: {
  //   flexDirection: 'row',
  //   width: '80%',
  //   alignSelf: 'center',
  //   paddingVertical: 8,
  // },
  // tableCell: {fontSize: 16, flex: 1, textAlign: 'center'},
  // open: {color: 'green'},
  // closed: {color: 'red'},
});

export default FaceDetection;
