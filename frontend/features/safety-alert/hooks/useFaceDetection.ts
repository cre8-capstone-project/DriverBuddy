import {useRef, useState} from 'react';
import {useSharedValue, useAnimatedStyle, withTiming} from 'react-native-reanimated';
import {useWindowDimensions} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {Frame} from 'react-native-vision-camera';
import {Face, FaceDetectionOptions} from 'react-native-vision-camera-face-detector';
import {useSpeech} from '@/hooks/useSpeech';
import {useOpenAI} from '@/hooks/useOpenAI';

export const useFaceDetection = () => {
  const {speak, isSpeaking} = useSpeech();
  const {generateMessage} = useOpenAI();
  const alertRef = useRef(false);

  const BLINK_COUNT_THRESHOLD = 30; // to be adjusted
  const OPEN_EYE_PROBABILITY_THRESHOLD = 0.7; // to be adjusted
  const EYECLOSE_TIME_THRESHOLD = 1500; // to be adjusted
  const PITCH_DOWN_ANGLE_THRESHOLD = -5; // to be adjusted
  const PITCH_UP_ANGLE_THRESHOLD = 15; // to be adjusted
  const LOOKDOWN_TIME_THRESHOLD = 2000; // to be adjusted

  // For drowsiness detection
  const startTimeDrowsinessRef = useRef<number | null>(null);
  const [leftEyeStatus, setLeftEyeStatus] = useState(false);
  const [rightEyeStatus, setRightEyeStatus] = useState(false);

  // For looking away detection
  const startTimeLookDownRef = useRef<number | null>(null);
  const [pitchAngleStatus, setPitchAngleStatus] = useState('center');

  // Face detection settings
  const {width, height} = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const cameraHeight = height - tabBarHeight;

  // Configuration options for face detection (Refer to Google ML Kit documentation)
  // https://developers.google.com/ml-kit/vision/face-detection/face-detection-concepts
  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    performanceMode: 'accurate',
    landmarkMode: 'all',
    contourMode: 'none',
    classificationMode: 'all',
    trackingEnabled: false,
    windowWidth: width,
    windowHeight: cameraHeight,
    autoScale: true,
  }).current;

  const aFaceW = useSharedValue(0);
  const aFaceH = useSharedValue(0);
  const aFaceX = useSharedValue(0);
  const aFaceY = useSharedValue(0);
  const borderWidth = useSharedValue(4);

  const faceBorderStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    borderWidth: borderWidth.value,
    borderColor: 'rgb(0,255,0)',
    width: withTiming(aFaceW.value, {duration: 100}),
    height: withTiming(aFaceH.value, {duration: 100}),
    left: withTiming(aFaceX.value, {duration: 100}),
    top: withTiming(aFaceY.value, {duration: 100}),
  }));

  const hideFaceBorder = () => {
    borderWidth.value = 0;
  };

  const showFaceBorder = () => {
    borderWidth.value = 4;
  };

  const handleFacesDetection = (faces: Face[], frame: Frame) => {
    try {
      if (faces.length > 0) {
        const face = faces[0];
        showFaceBorder();
        updateFaceBounds(face);

        const prompt = `Your friend looks sleepy while driving. 
                        Please say something over the phone to wake him up from his drowsiness.
                        The message should be simple and clear.`;
        checkDrowsiness(face, () => generateMessage(prompt));
        checkLookingAway(face, () => generateMessage(prompt));
      } else {
        console.log('No face detected');
        hideFaceBorder();
        updateFaceBounds();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateFaceBounds = (face?: Face) => {
    if (face) {
      const {bounds} = face;
      const {width, height, x, y} = bounds;
      aFaceW.value = width;
      aFaceH.value = height;
      aFaceX.value = x;
      aFaceY.value = y;
    } else {
      aFaceW.value = 0;
      aFaceH.value = 0;
      aFaceX.value = 0;
      aFaceY.value = 0;
    }
  };

  const [blinkCount, setBlinkCount] = useState(0);
  const blinkTimestampsRef = useRef<number[]>([]);
  const blinkStatusRef = useRef<'closed' | 'open'>('open');

  const checkDrowsiness = (face: Face, alertFunction: () => Promise<string>) => {
    const isLeftEyeClosed = face.leftEyeOpenProbability < OPEN_EYE_PROBABILITY_THRESHOLD;
    const isRightEyeClosed = face.rightEyeOpenProbability < OPEN_EYE_PROBABILITY_THRESHOLD;
    setLeftEyeStatus(isLeftEyeClosed);
    setRightEyeStatus(isRightEyeClosed);

    if (isLeftEyeClosed && isRightEyeClosed) {
      blinkStatusRef.current = 'closed';
      if (alertRef.current) return;

      if (startTimeDrowsinessRef.current === null) {
        startTimeDrowsinessRef.current = Date.now();
      } else if (Date.now() - startTimeDrowsinessRef.current > EYECLOSE_TIME_THRESHOLD) {
        triggerAlert(alertFunction);
        startTimeDrowsinessRef.current = null;
      }
    } else {
      if (blinkStatusRef.current === 'closed') {
        recordBlink();
        if (blinkCount > BLINK_COUNT_THRESHOLD) {
          triggerAlert(alertFunction);
          blinkTimestampsRef.current = [];
        }
      }
      blinkStatusRef.current = 'open';
      startTimeDrowsinessRef.current = null;
    }
  };

  const recordBlink = () => {
    const now = Date.now();

    // Remove timestamps older than 1 minute
    blinkTimestampsRef.current = blinkTimestampsRef.current.filter(
      timestamp => now - timestamp <= 60000,
    );
    blinkTimestampsRef.current.push(now);
    setBlinkCount(blinkTimestampsRef.current.length);
  };

  const checkLookingAway = (face: Face, alertFunction: () => Promise<string>) => {
    const isLookingDown = face.pitchAngle < PITCH_DOWN_ANGLE_THRESHOLD;
    const isLookingUp = face.pitchAngle > PITCH_UP_ANGLE_THRESHOLD;
    setPitchAngleStatus(isLookingUp ? 'up' : isLookingDown ? 'down' : 'center');

    if (pitchAngleStatus !== 'center') {
      if (alertRef.current) return;

      if (startTimeLookDownRef.current === null) {
        startTimeLookDownRef.current = Date.now();
      } else if (Date.now() - startTimeLookDownRef.current > LOOKDOWN_TIME_THRESHOLD) {
        triggerAlert(alertFunction);
        startTimeLookDownRef.current = null;
      }
    } else {
      startTimeLookDownRef.current = null;
    }
  };

  const triggerAlert = async (alertFunction: () => Promise<string>) => {
    alertRef.current = true;
    const message = await alertFunction();
    speak(message);
    alertRef.current = false;
  };

  return {
    faceDetectionOptions,
    handleFacesDetection,
    faceBorderStyle,
    leftEyeStatus,
    rightEyeStatus,
    pitchAngleStatus,
    blinkCount,
    isWarning: isSpeaking,
  };
};
