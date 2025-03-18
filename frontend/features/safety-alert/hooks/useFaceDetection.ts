import {useEffect, useRef} from 'react';
import {useWindowDimensions} from 'react-native';
import {Frame} from 'react-native-vision-camera';
import {Face, FaceDetectionOptions} from 'react-native-vision-camera-face-detector';
import {useFaceBounds} from '@/features/safety-alert/hooks/useFaceBounds';
import {useSpeech} from '@/hooks/useSpeech';
// import {useOpenAI} from '@/hooks/useOpenAI';
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
  const {speak, isSpeaking} = useSpeech();
  const alertSoundRef = useRef<Audio.Sound | null>(null);
  const warningSoundRef = useRef<Audio.Sound | null>(null);

  // const {generateMessage} = useOpenAI();
  const {faceBorderStyle, updateFaceBounds, showFaceBorder, hideFaceBorder} = useFaceBounds();
  const {checkDrowsiness, leftEyeStatus, rightEyeStatus, eyeBlinkRate, eyeBlinkRateData} =
    useDrowsinessDetection();
  const {checkLookingAway, pitchAngleStatus} = useLookAwayDetection();
  const {alertCount, setAlertCount, alertStatus, setAlertStatus} = useFaceDetectionContext();

  useEffect(() => {
    if (alertStatus && !isSpeaking) {
      setAlertStatus(false);
    }
  }, [isSpeaking]);

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
      if (alertSoundRef.current) {
        alertSoundRef.current.unloadAsync();
      }
      if (warningSoundRef.current) {
        warningSoundRef.current.unloadAsync();
      }
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
          triggerAlert(drowsinessAlertMessage.message, drowsinessAlertMessage.sound),
        );

        const distractedWarningMessage =
          DISTRACTED_WARNING_MESSAGE[Math.floor(Math.random() * DISTRACTED_WARNING_MESSAGE.length)];
        checkLookingAway(face, () =>
          triggerAlert(distractedWarningMessage.message, distractedWarningMessage.sound),
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

  const triggerAlert = async (alertMessage: string, alertSound: any) => {
    try {
      setAlertStatus(true);

      // Load and play the warning sound
      if (alertSoundRef.current) {
        await alertSoundRef.current.unloadAsync();
      }
      const {sound} = await Audio.Sound.createAsync(alertSound);
      alertSoundRef.current = sound;
      await sound.playAsync();

      setTimeout(() => {
        speak(alertMessage);
      }, 1000);

      // Log the alert to SQLite
      await AlertService.logAlert({
        alertId: uuid.v4(),
        faceDetectionSessionId: sessionIdRef.current,
        userId: user?.uid ?? '',
        timestamp: new Date().toISOString(),
      });
      setAlertCount((prev: number) => prev + 1);
    } catch (error) {
      console.error(error);
    }
  };

  // const triggerWarning = async (warningMessage: string, warningSound: any) => {
  //   try {
  //     if (warningSoundRef.current) {
  //       await warningSoundRef.current.unloadAsync();
  //     }
  //     const {sound} = await Audio.Sound.createAsync(warningSound);
  //     warningSoundRef.current = sound;
  //     await sound.playAsync();

  //     speak(warningMessage);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  return {
    faceDetectionOptions,
    handleFacesDetection,
    faceBorderStyle,
    leftEyeStatus,
    rightEyeStatus,
    pitchAngleStatus,
    eyeBlinkRate,
    eyeBlinkRateData,
    isSpeaking,
    alertCount,
  };
};
