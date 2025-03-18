import {useState, useRef, useEffect} from 'react';
import {Face} from 'react-native-vision-camera-face-detector';
import {
  OPEN_EYE_PROBABILITY_THRESHOLD,
  BLINK_DURATION_THRESHOLD,
  BLINK_MONITORING_DURATION_WINDOW,
  BLINK_COUNT_THRESHOLD_LOW,
  BLINK_COUNT_THRESHOLD_HIGH,
} from '../constants/thresholds';
import {useLookAwayDetection} from './useLookAwayDetection';
import {useFaceDetectionContext} from '@/contexts/FaceDetectionProvider';

export const useDrowsinessDetection = () => {
  const {alertStatus, setAlertStatus, setMessage, instructionStatus} = useFaceDetectionContext();
  const [leftEyeStatus, setLeftEyeStatus] = useState(false);
  const [rightEyeStatus, setRightEyeStatus] = useState(false);
  const {pitchAngleStatus} = useLookAwayDetection();
  const startTimeDrowsinessRef = useRef<number | null>(null);
  const blinkTimestampsRef = useRef<number[]>([]);
  const blinkStatusRef = useRef<'closed' | 'open'>('open');
  const blinkRegisteredRef = useRef<boolean>(false);
  const eyeBlinkRateRef = useRef<number>(0);
  const blinkCountsPer10SecRef = useRef<number[]>([]);
  const blinkCountsPer30SecRef = useRef<number[]>([]);
  const lastIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    console.log('[DEBUG] useDrowsinessDetection component is mounted');
    return () => {
      console.log('[DEBUG] useDrowsinessDetection component is unmounted');
      // Clear Face detection context
      setAlertStatus(false);
      setMessage('');
      // Clear all refs when the component unmounts
      startTimeDrowsinessRef.current = null;
      blinkTimestampsRef.current = [];
      blinkStatusRef.current = 'open';
      blinkRegisteredRef.current = false;
      eyeBlinkRateRef.current = 0;
      blinkCountsPer10SecRef.current = [];
      blinkCountsPer30SecRef.current = [];
      lastIntervalRef.current = null;
    };
  }, []);

  // Keep the last 60 seconds blinks record
  const recordBlink = () => {
    const now = Date.now();
    blinkTimestampsRef.current = blinkTimestampsRef.current.filter(
      timestamp => now - timestamp <= 60000,
    );
    blinkTimestampsRef.current.push(now);
  };

  const calculateBlinkRateWithMovingAverage = (triggerAlert: () => Promise<void>) => {
    const now = Date.now();

    // Process every 10 seconds
    if (lastIntervalRef.current === null) {
      lastIntervalRef.current = now;
      return;
    }
    if (now - lastIntervalRef.current >= 10000) {
      lastIntervalRef.current = now;

      // Get the latest 10 seconds blink count
      const countInLast10Sec = blinkTimestampsRef.current.filter(
        timestamp => now - timestamp <= 10000,
      ).length;

      // Keep the last 3 intervals
      blinkCountsPer10SecRef.current.push(countInLast10Sec);
      if (blinkCountsPer10SecRef.current.length > 3) {
        blinkCountsPer10SecRef.current.shift();
      }

      // Calculate the moving average
      if (blinkCountsPer10SecRef.current.length !== 3) return;
      const totalBlinksOf30sec = blinkCountsPer10SecRef.current.reduce((sum, val) => sum + val, 0);

      // Keep the last 3 moving averages
      blinkCountsPer30SecRef.current.push(Math.round(totalBlinksOf30sec * 2));
      if (blinkCountsPer30SecRef.current.length > 3) {
        blinkCountsPer30SecRef.current.shift();
      }
      console.log('Eye Blink Rate (Data):', blinkCountsPer30SecRef.current);

      // Calculate the average of the last 3 moving averages
      if (blinkCountsPer30SecRef.current.length !== 3) return;
      eyeBlinkRateRef.current = Math.round(
        blinkCountsPer30SecRef.current.reduce((sum, val) => sum + val, 0) /
          blinkCountsPer30SecRef.current.length,
      );
      console.log('Eye Blink Rate:', eyeBlinkRateRef.current);

      if (
        blinkCountsPer30SecRef.current.length === 3 &&
        (eyeBlinkRateRef.current < BLINK_COUNT_THRESHOLD_LOW ||
          eyeBlinkRateRef.current > BLINK_COUNT_THRESHOLD_HIGH)
      ) {
        triggerAlert();
        console.log('Drowsiness alert triggered due to abnormal blinking pattern');
      }
    }
  };

  const calculateBlinkRate = (triggerAlert: () => Promise<void>) => {
    const now = Date.now();

    if (lastIntervalRef.current === null) {
      lastIntervalRef.current = now;
      return;
    }
    // Note: To reduce burden on the system, we only check every 500ms
    if (now - lastIntervalRef.current >= 100) {
      lastIntervalRef.current = now;
      eyeBlinkRateRef.current = blinkTimestampsRef.current.filter(
        timestamp => now - timestamp <= BLINK_MONITORING_DURATION_WINDOW,
      ).length;
      if (eyeBlinkRateRef.current > BLINK_COUNT_THRESHOLD_HIGH) {
        if (pitchAngleStatus !== 'center' || alertStatus || instructionStatus) {
          blinkTimestampsRef.current = [];
          return;
        }
        triggerAlert();
        blinkTimestampsRef.current = [];
        setMessage('Blink Rate');
      }
    }
  };

  const checkDrowsiness = (face: Face, triggerAlert: () => Promise<void>) => {
    const isLeftEyeClosed = face.leftEyeOpenProbability < OPEN_EYE_PROBABILITY_THRESHOLD;
    const isRightEyeClosed = face.rightEyeOpenProbability < OPEN_EYE_PROBABILITY_THRESHOLD;

    setLeftEyeStatus(isLeftEyeClosed);
    setRightEyeStatus(isRightEyeClosed);

    // Checking eye closure time threshold
    if (isLeftEyeClosed && isRightEyeClosed) {
      if (blinkStatusRef.current !== 'closed') {
        blinkStatusRef.current = 'closed';
        blinkRegisteredRef.current = false; // Not count up while eyes are continuously closed
      }

      if (startTimeDrowsinessRef.current === null) {
        startTimeDrowsinessRef.current = Date.now();
      } else if (Date.now() - startTimeDrowsinessRef.current > BLINK_DURATION_THRESHOLD) {
        // Skip if the driver is not looking straight or alerting
        if (pitchAngleStatus !== 'center' || alertStatus || instructionStatus) {
          startTimeDrowsinessRef.current = null;
          return;
        }
        triggerAlert();
        blinkTimestampsRef.current = [];
        setMessage('Blink Duration');
        startTimeDrowsinessRef.current = null;
      }
    } else {
      blinkStatusRef.current = 'open';
      startTimeDrowsinessRef.current = null;
    }

    // Record blink count
    if (blinkStatusRef.current === 'closed' && !blinkRegisteredRef.current) {
      recordBlink();
      blinkRegisteredRef.current = true;
    }

    // Check Blink Rate
    calculateBlinkRate(triggerAlert);
    // calculateBlinkRateWithMovingAverage(triggerAlert);
  };

  return {
    leftEyeStatus,
    rightEyeStatus,
    eyeBlinkRate: eyeBlinkRateRef.current,
    checkDrowsiness,
  };
};
