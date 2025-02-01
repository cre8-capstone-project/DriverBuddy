import React, {useEffect, useRef, useState} from 'react';
import {Text, View, StyleSheet, useWindowDimensions} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {
  Camera as VisionCamera,
  Frame,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {Face, Camera, FaceDetectionOptions} from 'react-native-vision-camera-face-detector';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {useSpeech} from '@/components/ai-companion/useSpeech';
import {useOpenAI} from '@/components/ai-companion/useOpenAI';

function App() {
  const {speak} = useSpeech();
  const {alertDrowsiness} = useOpenAI();

  const device = useCameraDevice('front');
  const {hasPermission} = useCameraPermission();

  const {width, height} = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const cameraHeight = height - tabBarHeight;

  const [startTime, setStartTime] = useState<number | null>(null);
  const isAlertTriggeredRef = useRef(false);

  const [leftEyeStatus, setLeftEyeStatus] = useState(false);
  const [rightEyeStatus, setRightEyeStatus] = useState(false);

  // Configuration options for face detection (Refer to Google ML Kit documentation)
  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    performanceMode: 'accurate',
    landmarkMode: 'all',
    contourMode: 'all',
    classificationMode: 'all',
    trackingEnabled: true,
    windowWidth: width,
    windowHeight: cameraHeight,
    autoScale: true,
  }).current;

  useEffect(() => {
    (async () => {
      const status = await VisionCamera.requestCameraPermission();
      console.log({status});
    })();
  }, [device]);

  const aFaceW = useSharedValue(0);
  const aFaceH = useSharedValue(0);
  const aFaceX = useSharedValue(0);
  const aFaceY = useSharedValue(0);
  const aRot = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    borderWidth: 4,
    borderLeftColor: 'rgb(0,255,0)',
    borderRightColor: 'rgb(0,255,0)',
    borderBottomColor: 'rgb(0,255,0)',
    borderTopColor: 'rgb(0,255,0)',
    width: withTiming(aFaceW.value, {
      duration: 100,
    }),
    height: withTiming(aFaceH.value, {
      duration: 100,
    }),
    left: withTiming(aFaceX.value, {
      duration: 100,
    }),
    top: withTiming(aFaceY.value, {
      duration: 100,
    }),
    transform: [
      {
        rotate: `${aRot.value}deg`,
      },
    ],
  }));

  const handleFacesDetection = (faces: Face[], frame: Frame) => {
    if (faces.length > 0) {
      const face = faces[0];
      checkEyeStatus(face);
      updateFaceBounds(face);
    }
  };

  const updateFaceBounds = (face: Face) => {
    const {bounds} = face;
    const {width, height, x, y} = bounds;

    aFaceW.value = width;
    aFaceH.value = height;
    aFaceX.value = x;
    aFaceY.value = y;
  };

  const checkEyeStatus = (face: Face) => {
    const isLeftEyeClosed = face.leftEyeOpenProbability < 0.8;
    const isRightEyeClosed = face.rightEyeOpenProbability < 0.8;

    setLeftEyeStatus(isLeftEyeClosed);
    setRightEyeStatus(isRightEyeClosed);

    if (isLeftEyeClosed && isRightEyeClosed) {
      if (!isAlertTriggeredRef.current) {
        if (!startTime) {
          setStartTime(Date.now());
        } else if (Date.now() - startTime > 1000) {
          triggerAlert();
          isAlertTriggeredRef.current = true;
        }
      }
    } else {
      setStartTime(null);
    }
  };

  const triggerAlert = async () => {
    const message = await alertDrowsiness();
    speak(message);
    isAlertTriggeredRef.current = false;
  };

  if (!hasPermission) return <Text>Permission Error</Text>;
  if (device == null) return <Text>Device Not Found Error</Text>;

  return (
    <View style={styles.container}>
      {!!device ? (
        <>
          <Camera
            style={styles.camera}
            device={device}
            isActive={true}
            faceDetectionCallback={handleFacesDetection}
            faceDetectionOptions={faceDetectionOptions}
          />
          <Animated.View style={animatedStyle} />
          <View style={styles.tableContainer}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeader}>Eye</Text>
              <Text style={styles.tableHeader}>Status</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Left Eye</Text>
              <Text
                style={[styles.tableCell, leftEyeStatus === true ? styles.closed : styles.open]}>
                {leftEyeStatus ? 'Closed' : 'Open'}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Right Eye</Text>
              <Text
                style={[styles.tableCell, rightEyeStatus === true ? styles.closed : styles.open]}>
                {rightEyeStatus ? 'Closed' : 'Open'}
              </Text>
            </View>
          </View>
        </>
      ) : (
        <Text>No Device</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  open: {
    color: 'green',
  },
  closed: {
    color: 'red',
  },
  errorText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 16,
    color: 'red',
  },
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
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  tableCell: {
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  map: {},
});

export default App;
