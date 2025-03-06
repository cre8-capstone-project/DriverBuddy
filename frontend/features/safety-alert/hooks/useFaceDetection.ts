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
import {logFaceDetectionSessionData} from '@/api/api';
import uuid from 'react-native-uuid';
import {useAuth} from '@/contexts/AuthProvider';

export const useFaceDetection = () => {
  const {user} = useAuth();
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
      userId: user?.uid ?? '',
      startTime: new Date().toISOString(),
    });

    return () => {
      FDSessionService.endFDSession({
        faceDetectionSessionId: sessionId,
        userId: user?.uid ?? '',
        endTime: new Date().toISOString(),
      });

      // Send the session data to the cloud database
      FDSessionService.getFDSessionDataById(sessionId)
        .then(session => {
          return logFaceDetectionSessionData(session);
        })
        .then(response => {
          if (response) {
            console.log('Session successfully registered to the cloud database:', response);
          } else {
            console.error('Failed to register the session to the cloud database.');
          }
        })
        .catch(error => {
          console.error('An error occurred while registering the session:', error);
        });
    };
  }, [user?.uid]);

  const handleFacesDetection = (faces: Face[], frame: Frame) => {
    try {
      if (faces.length > 0) {
        const face = faces[0];
        showFaceBorder();
        updateFaceBounds(face);

        const prompt = `Give a short sentence of encouragement to a drowsy driver.`;
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
        userId: user?.uid ?? '',
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
