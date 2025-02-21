import {useEffect, useRef} from 'react';
import {useWindowDimensions} from 'react-native';
import {Frame} from 'react-native-vision-camera';
import {Face, FaceDetectionOptions} from 'react-native-vision-camera-face-detector';
import {useFaceBounds} from '@/features/safety-alert/hooks/useFaceBounds';
import {useSpeech} from '@/hooks/useSpeech';
import {useOpenAI} from '@/hooks/useOpenAI';
import {AlertService} from '@/services/AlertService';
import {useDrowsinessDetection} from '@/features/safety-alert/hooks/useDrowsinessDetection';
import {useLookAwayDetection} from '@/features/safety-alert/hooks/useLookAwayDetection';
import {FDSessionService} from '@/services/FDSessionService';
import uuid from 'react-native-uuid';

export const useFaceDetection = () => {
  const {width, height} = useWindowDimensions();
  const {speak, isSpeaking} = useSpeech();
  const {generateMessage} = useOpenAI();
  const alertRef = useRef(false);
  const {faceBorderStyle, updateFaceBounds, showFaceBorder, hideFaceBorder} = useFaceBounds();
  const {checkDrowsiness, leftEyeStatus, rightEyeStatus, blinkCount} = useDrowsinessDetection();
  const {checkLookingAway, pitchAngleStatus} = useLookAwayDetection();

  // Configuration options for face detection (Refer to Google ML Kit documentation)
  // https://developers.google.com/ml-kit/vision/face-detection/face-detection-concepts
  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    performanceMode: 'accurate',
    landmarkMode: 'all',
    contourMode: 'none',
    classificationMode: 'all',
    trackingEnabled: false,
    windowWidth: width,
    windowHeight: height,
    autoScale: true,
  }).current;

  const sessionIdRef = useRef<string>(uuid.v4() as string);

  useEffect(() => {
    const sessionId = sessionIdRef.current;
    FDSessionService.startFDSession({
      faceDetectionSessionId: sessionId,
      userId: '1',
      startTime: new Date().toISOString(),
    });

    return () => {
      FDSessionService.endFDSession({
        faceDetectionSessionId: sessionId,
        userId: `1`,
        endTime: new Date().toISOString(),
      });
    };
  }, []);

  const handleFacesDetection = (faces: Face[], frame: Frame) => {
    try {
      if (faces.length > 0) {
        const face = faces[0];
        showFaceBorder();
        updateFaceBounds(face);

        const prompt = `Your friend looks sleepy while driving. 
                        Please say something over the phone to wake him up from his drowsiness.
                        The message should be simple and clear.`;

        checkDrowsiness(face, () => triggerAlert(() => generateMessage(prompt)));
        checkLookingAway(face, () => triggerAlert(() => generateMessage(prompt)));
      } else {
        // console.log('No face detected');
        hideFaceBorder();
        updateFaceBounds();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const triggerAlert = async (alertFunction: () => Promise<string>) => {
    try {
      alertRef.current = true;

      // Execute text to speech to read out the message
      const message = await alertFunction();
      speak(message);

      // Log the alert to SQLite
      await AlertService.logAlert({
        alertId: uuid.v4(),
        faceDetectionSessionId: sessionIdRef.current,
        userId: '1',
        timestamp: new Date().toISOString(),
      });

      alertRef.current = false;
    } catch (error) {
      console.error(error);
    }
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
