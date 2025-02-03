import {useRef, useState} from 'react';
import {useSharedValue, useAnimatedStyle, withTiming} from 'react-native-reanimated';
import {useWindowDimensions} from 'react-native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {Frame} from 'react-native-vision-camera';
import {Face, FaceDetectionOptions} from 'react-native-vision-camera-face-detector';
import {useSpeech} from '@/features/safety-alert/hooks/useSpeech';
import {useOpenAI} from '@/features/safety-alert/hooks/useOpenAI';

export const useFaceDetection = () => {
  const {speak} = useSpeech();
  const {generateMessage} = useOpenAI();

  // For FaceBounds drawing
  const {width, height} = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const cameraHeight = height - tabBarHeight;

  // For drowsiness detection
  const [startTimeDrowsiness, setStartTimeDrowsiness] = useState<number | null>(null);
  const drowsinessAlertRef = useRef(false);
  const [leftEyeStatus, setLeftEyeStatus] = useState(false);
  const [rightEyeStatus, setRightEyeStatus] = useState(false);

  // For looking away detection
  const [startTimeLoookingAway, setStartTimeLoookingAway] = useState<number | null>(null);
  const lookingAwayAlertRef = useRef(false);
  const [yawAngleStatus, setYawAngleStatus] = useState('center');

  // Configuration options for face detection (Refer to Google ML Kit documentation)
  // https://developers.google.com/ml-kit/vision/face-detection/face-detection-concepts
  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    performanceMode: 'accurate',
    landmarkMode: 'all',
    // contourMode: 'all',
    classificationMode: 'all',
    trackingEnabled: true,
    windowWidth: width,
    windowHeight: cameraHeight,
    autoScale: true,
  }).current;

  const aFaceW = useSharedValue(0);
  const aFaceH = useSharedValue(0);
  const aFaceX = useSharedValue(0);
  const aFaceY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    borderWidth: 4,
    borderColor: 'rgb(0,255,0)',
    width: withTiming(aFaceW.value, {duration: 100}),
    height: withTiming(aFaceH.value, {duration: 100}),
    left: withTiming(aFaceX.value, {duration: 100}),
    top: withTiming(aFaceY.value, {duration: 100}),
  }));

  const handleFacesDetection = (faces: Face[], frame: Frame) => {
    if (faces.length > 0) {
      const face = faces[0];

      updateFaceBounds(face);
      const checkDrowsinessPrompt =
        'The driver seems to be feeling drowsy. Please create a concise and casual message that sounds more like someone is directly speaking to them to alert them.';
      checkDrowsiness(face, () => generateMessage(checkDrowsinessPrompt));
      const checkLookingAwayPrompt =
        'The driver seems to be looking away from the road. Please create a concise and casual message that sounds more like someone is directly speaking to them to alert them and remind them to keep their eyes on the road.';
      checkLookingAway(face, () => generateMessage(checkLookingAwayPrompt));
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

  const checkDrowsiness = (face: Face, alertFunction: () => Promise<string>) => {
    const isLeftEyeClosed = face.leftEyeOpenProbability < 0.8;
    const isRightEyeClosed = face.rightEyeOpenProbability < 0.8;
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
    const isLookingRight = face.yawAngle < -30;
    const isLookingLeft = face.yawAngle > 30;
    setYawAngleStatus(isLookingRight ? 'right' : isLookingLeft ? 'left' : 'center');

    if (yawAngleStatus !== 'center') {
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
    animatedStyle,
    leftEyeStatus,
    rightEyeStatus,
    yawAngleStatus,
  };
};
