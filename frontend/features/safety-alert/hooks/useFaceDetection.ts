import {useRef, useState} from 'react';
import {useSharedValue, useAnimatedStyle, withTiming} from 'react-native-reanimated';
import {useWindowDimensions} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {Frame} from 'react-native-vision-camera';
import {Face, FaceDetectionOptions} from 'react-native-vision-camera-face-detector';
import {useSpeech} from '@/features/safety-alert/hooks/useSpeech';
import {useOpenAI} from '@/features/safety-alert/hooks/useOpenAI';

export const useFaceDetection = () => {
  const {speak, isSpeaking} = useSpeech();
  const {generateMessage} = useOpenAI();

  // For drowsiness detection
  const [startTimeDrowsiness, setStartTimeDrowsiness] = useState<number | null>(null);
  const drowsinessAlertRef = useRef(false);
  const [leftEyeStatus, setLeftEyeStatus] = useState(false);
  const [rightEyeStatus, setRightEyeStatus] = useState(false);

  // For looking away detection
  const [startTimeLoookingAway, setStartTimeLoookingAway] = useState<number | null>(null);
  const lookingAwayAlertRef = useRef(false);
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

  const faceBorderdStyle = useAnimatedStyle(() => ({
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

        const prompt = `Imagine you're a close friend talking to someone who is feeling drowsy while driving.  
          Generate a very short, friendly, and attention-grabbing message that sounds natural and conversational.  
          Keep it simple, casual, and urgent enough to wake them up and keep them focused on the road.`;

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

  const checkDrowsiness = (face: Face, alertFunction: () => Promise<string>) => {
    const isLeftEyeClosed = face.leftEyeOpenProbability < 0.7; // to be adjusted
    const isRightEyeClosed = face.rightEyeOpenProbability < 0.7; // to be adjusted
    setLeftEyeStatus(isLeftEyeClosed);
    setRightEyeStatus(isRightEyeClosed);

    if (isLeftEyeClosed && isRightEyeClosed) {
      if (!drowsinessAlertRef.current) {
        if (!startTimeDrowsiness) {
          setStartTimeDrowsiness(Date.now());
        } else if (Date.now() - startTimeDrowsiness > 1000 && !lookingAwayAlertRef.current) {
          triggerAlert(alertFunction);
          drowsinessAlertRef.current = true;
        }
      }
    } else {
      setStartTimeDrowsiness(null);
    }
  };

  const checkLookingAway = (face: Face, alertFunction: () => Promise<string>) => {
    console.log(face.pitchAngle);
    const isLookingDown = face.pitchAngle < -5; // to be adjusted
    const isLookingUp = face.pitchAngle > 15; // to be adjusted
    setPitchAngleStatus(isLookingUp ? 'up' : isLookingDown ? 'down' : 'center');

    if (pitchAngleStatus !== 'center') {
      if (!lookingAwayAlertRef.current) {
        if (!startTimeLoookingAway) {
          setStartTimeLoookingAway(Date.now());
        } else if (Date.now() - startTimeLoookingAway > 2000 && !drowsinessAlertRef.current) {
          triggerAlert(alertFunction);
          lookingAwayAlertRef.current = true;
        }
      }
    } else {
      setStartTimeLoookingAway(null);
    }
  };

  const triggerAlert = async (alertFunction: () => Promise<string>) => {
    const message = await alertFunction();
    speak(message);
    drowsinessAlertRef.current = false;
    lookingAwayAlertRef.current = false;
  };

  return {
    faceDetectionOptions,
    handleFacesDetection,
    faceBorderdStyle,
    leftEyeStatus,
    rightEyeStatus,
    pitchAngleStatus,
    isWarning: isSpeaking,
  };
};
