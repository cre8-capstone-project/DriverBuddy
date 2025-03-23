import {useEffect, useRef} from 'react';
import {useWindowDimensions} from 'react-native';
import {Frame} from 'react-native-vision-camera';
import {Face, FaceDetectionOptions} from 'react-native-vision-camera-face-detector';
import {useFaceBounds} from '@/features/safety-alert/hooks/useFaceBounds';
import {AlertService} from '@/services/AlertService';
import {useDrowsinessDetection} from '@/features/safety-alert/hooks/useDrowsinessDetection';
import {useLookAwayDetection} from '@/features/safety-alert/hooks/useLookAwayDetection';
import {FDSessionService} from '@/services/FDSessionService';
import {logFaceDetectionSessionData} from '@/api/api';
import uuid from 'react-native-uuid';
import {useAuth} from '@/contexts/AuthProvider';
import {useFaceDetectionContext} from '@/contexts/FaceDetectionProvider';
import {
  DRAWSINESS_ALERT_MESSAGE,
  DISTRACTED_WARNING_MESSAGE,
} from '@/features/safety-alert/constants/messages';
import {Audio} from 'expo-av';

export const useFaceDetection = () => {
  const {user} = useAuth();
  const {width, height} = useWindowDimensions();
  const {faceBorderStyle, updateFaceBounds, showFaceBorder, hideFaceBorder} = useFaceBounds();
  const {checkDrowsiness, leftEyeStatus, rightEyeStatus, eyeBlinkRate1, eyeBlinkRate2} =
    useDrowsinessDetection();
  const {checkLookingAway, pitchAngleStatus} = useLookAwayDetection();
  const {alertCount, setAlertCount, setAlertStatus} = useFaceDetectionContext();

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
    console.log('[DEBUG] useFaceDetection component is mounted');

    return () => {
      console.log('[DEBUG] useFaceDetection component is unmounted');
    };
  }, []);

  useEffect(() => {
    const sessionId = sessionIdRef.current;
    FDSessionService.startFDSession({
      faceDetectionSessionId: sessionId,
      userId: user?.uid ?? '',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
    });
    console.log('[DEBUG] Start FDSession:', sessionId);

    return () => {
      FDSessionService.endFDSession({
        faceDetectionSessionId: sessionId,
        userId: user?.uid ?? '',
        endTime: new Date().toISOString(),
      });
      console.log('[DEBUG] End FDSession:', sessionId);

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

      setAlertCount(0); //Reset FaceDetectionContext alert count
    };
  }, [user?.uid]);

  const handleFacesDetection = (faces: Face[], frame: Frame) => {
    try {
      if (faces.length > 0) {
        const face = faces[0];
        showFaceBorder();
        updateFaceBounds(face);

        // Note: The prompt message is randomly selected from the array. Not using Open AI API
        // const prompt = `Give a short sentence of encouragement to a drowsy driver.`;
        const drowsinessAlertMessage =
          DRAWSINESS_ALERT_MESSAGE[Math.floor(Math.random() * DRAWSINESS_ALERT_MESSAGE.length)];
        checkDrowsiness(face, () =>
          triggerAlert(drowsinessAlertMessage.voice, drowsinessAlertMessage.sound),
        );

        const distractedWarningMessage =
          DISTRACTED_WARNING_MESSAGE[Math.floor(Math.random() * DISTRACTED_WARNING_MESSAGE.length)];
        checkLookingAway(face, () =>
          triggerAlert(distractedWarningMessage.voice, distractedWarningMessage.sound),
        );
      } else {
        // console.log('No face detected');
        hideFaceBorder();
        updateFaceBounds();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const triggerAlert = async (alertMessage: any, alertSound: any) => {
    try {
      setAlertStatus(true);
      setAlertCount((prev: number) => prev + 1);
      await playSound(alertSound);
      await playSound(alertMessage);
      setAlertStatus(false);

      // Log the alert to SQLite
      await AlertService.logAlert({
        alertId: uuid.v4(),
        faceDetectionSessionId: sessionIdRef.current,
        userId: user?.uid ?? '',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const playSound = async (soundUri: any) => {
    try {
      const {sound} = await Audio.Sound.createAsync(soundUri, {shouldPlay: true});
      await new Promise<void>(resolve => {
        sound.setOnPlaybackStatusUpdate(status => {
          if (status.isLoaded && status.didJustFinish) {
            resolve();
          }
        });
      });
      sound.setOnPlaybackStatusUpdate(null);
      await sound.unloadAsync();
    } catch (error) {
      console.error('playSound error:', error);
    }
  };

  return {
    faceDetectionOptions,
    handleFacesDetection,
    faceBorderStyle,
    leftEyeStatus,
    rightEyeStatus,
    pitchAngleStatus,
    eyeBlinkRate1,
    eyeBlinkRate2,
    alertCount,
  };
};
