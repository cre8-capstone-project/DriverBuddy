import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {Camera} from 'react-native-vision-camera-face-detector';
import Animated from 'react-native-reanimated';
import {useFaceDetection} from '@/features/safety-alert/hooks/useFaceDetection';
import {WarningMessage} from '@/features/safety-alert/components/WarningMessage';

const DEBUG_MODE = true;

const FaceDetection = ({device}: {device: any}) => {
  const {
    faceDetectionOptions,
    handleFacesDetection,
    faceBorderStyle,
    isWarning,
    leftEyeStatus,
    rightEyeStatus,
    pitchAngleStatus,
    blinkCount,
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
      <WarningMessage isWarning={isWarning} />

      {DEBUG_MODE && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Debug Mode ON:{'\n'}
            Left Eye={leftEyeStatus ? 'closed' : 'open'}
            {'\n'}
            Right Eye={rightEyeStatus ? 'closed' : 'open'}
            {'\n'}
            Blinks/min: {blinkCount}
            {'\n'}
            Face Direction: {pitchAngleStatus}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  camera: {...StyleSheet.absoluteFillObject},
  debugContainer: {
    position: 'absolute',
    top: '5%',
    left: '2%',
  },
  debugText: {
    color: '#00FFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default FaceDetection;
