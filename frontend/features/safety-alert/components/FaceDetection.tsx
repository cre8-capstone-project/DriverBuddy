import React, {useEffect} from 'react';
import {View, StyleSheet, Text, Image, Dimensions} from 'react-native';
import {Camera} from 'react-native-vision-camera-face-detector';
import Animated from 'react-native-reanimated';
import {useFaceDetection} from '@/features/safety-alert/hooks/useFaceDetection';
import {AlertingMessage} from '@/features/safety-alert/components/AlertingMessage';
import {FaceDetectingLabel} from '@/features/safety-alert/components/FaceDetectingLabel';
import {useFaceDetectionContext} from '@/contexts/FaceDetectionProvider';
import {Icon} from '@rneui/themed';
import type {ViewModeType} from '@/types/ViewModeType';

const eyeIcon = require('@/assets/images/icon_detecting.png');
const {width} = Dimensions.get('window');

const DEBUG_MODE = true;

type Props = {
  device: any;
  viewMode: ViewModeType;
};

const FaceDetection = ({device, viewMode}: Props) => {
  const {alertCount, alertStatus} = useFaceDetectionContext();

  useEffect(() => {
    console.log('[DEBUG] FaceDetection component is mounted');
    return () => {
      console.log('[DEBUG] FaceDetection component is unmounted');
    };
  }, []);

  const {
    faceDetectionOptions,
    handleFacesDetection,
    faceBorderStyle,
    leftEyeStatus,
    rightEyeStatus,
    pitchAngleStatus,
    eyeBlinkRate,
    eyeBlinkRateData,
  } = useFaceDetection();

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
      <AlertingMessage isAlerting={alertStatus} />
      {viewMode === 'cameraView' && <FaceDetectingLabel />}
      {viewMode === 'mapView' && (
        <>
          <View style={[styles.alertContainer, {bottom: 85}]}>
            <Image source={eyeIcon} style={styles.icon} />
            <Text style={styles.alertText}>{alertCount} times</Text>
          </View>
          <View
            style={[
              styles.alertContainer,
              {bottom: 0, backgroundColor: 'lightgreen'},
              {backgroundColor: alertStatus ? '#FF4B4B' : 'lightgreen'},
            ]}>
            <Icon name="visibility" color="black" size={65} />
            <Text style={[styles.alertText, {color: 'black'}]}>Detecting</Text>
          </View>
        </>
      )}

      {DEBUG_MODE && (
        <View style={styles.debugContainer}>
          <Text style={[styles.debugText, {color: alertStatus ? '#FF4B4B' : 'lightgreen'}]}>
            Debug Mode ON:{'\n'}
            Left Eye={leftEyeStatus ? 'closed' : 'open'}
            {'\n'}
            Right Eye={rightEyeStatus ? 'closed' : 'open'}
            {'\n'}
            Eye Blink Rate: {eyeBlinkRate}/min
            {'\n'}
            Eye Blink Rate (Data): {eyeBlinkRateData}
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
  camera: {...StyleSheet.absoluteFillObject, width: width + 40}, //tentative workaround for camera view's mini window issue
  alertContainer: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 10,
    bottom: 0,
    width: '100%',
    height: 85,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  alertText: {
    color: 'white',
    fontSize: 55,
    fontWeight: 'bold',
  },
  icon: {
    width: 75,
    height: 75,
  },
  debugContainer: {
    position: 'absolute',
    top: '5%',
    left: '50%',
  },
  debugText: {
    color: 'lightgreen',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default FaceDetection;
