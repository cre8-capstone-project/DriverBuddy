import React, {useEffect} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {Camera} from 'react-native-vision-camera-face-detector';
import Animated from 'react-native-reanimated';
// import {useFaceDetection} from '@/features/safety-alert/hooks/useFaceDetection';
import {useFaceDetectionContext} from '@/contexts/FaceDetectionProvider';
import {WarningMessage} from '@/features/safety-alert/components/WarningMessage';
import {FaceDetectingLabel} from '@/features/safety-alert/components/FaceDetectingLabel';
import type {ViewModeType} from '@/types/ViewModeType';

const DEBUG_MODE = true;

type Props = {
  device: any;
  viewMode: ViewModeType;
};

const FaceDetection = ({device, viewMode}: Props) => {
  const {
    faceDetectionOptions,
    handleFacesDetection,
    faceBorderStyle,
    leftEyeStatus,
    rightEyeStatus,
    pitchAngleStatus,
    blinkCount,
    isWarning,
  } = useFaceDetectionContext();

  useEffect(() => {
    return () => {
      console.log('FaceDetection component is unmounting, cleaning up...');
    };
  }, []);

  return (
    <View style={styles.container}>
      <Camera
        key={viewMode}
        style={styles.camera}
        device={device}
        isActive={true}
        faceDetectionCallback={handleFacesDetection}
        faceDetectionOptions={faceDetectionOptions}
      />
      <Animated.View style={faceBorderStyle} />
      <WarningMessage isWarning={isWarning} />
      <FaceDetectingLabel />

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
    right: '2%',
  },
  debugText: {
    color: 'lightgreen',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default FaceDetection;
