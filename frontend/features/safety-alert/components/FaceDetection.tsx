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
const faceIcon = require('@/assets/images/icon_face.png');
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
          <View>
            <View
              style={{
                flexDirection: 'row',
                gap: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Icon name="visibility" color="white" size={16} />
              <Text style={[styles.debugText, {color: 'white'}]}>Eyes</Text>
            </View>
            <Text style={{fontSize: 20, color: 'white'}}>
              {leftEyeStatus || rightEyeStatus ? 'Closed' : 'Open'}
            </Text>
          </View>
          <View>
            <View
              style={{
                flexDirection: 'row',
                gap: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {/* <Icon name="child-care" color="white" size={16} /> */}
              <Image source={faceIcon} style={[{width: 16, height: 15.22}]} />
              <Text style={[styles.debugText, {color: 'white'}]}>Face</Text>
            </View>
            <Text style={{fontSize: 20, color: 'white'}}>
              {pitchAngleStatus.charAt(0).toUpperCase() + pitchAngleStatus.slice(1)}
            </Text>
          </View>
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
    backgroundColor: 'rgba(10, 10, 10, 0.6)',
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
    flexDirection: 'column',
    gap: 20,
    top: 10,
    right: 10,
    borderRadius: 15,
    height: 150,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.6)',
  },
  debugText: {
    color: 'lightgreen',
    fontSize: 16,
    // fontWeight: 'bold',
  },
});

export default FaceDetection;
