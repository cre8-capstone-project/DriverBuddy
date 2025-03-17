import {useState, useRef} from 'react';
import {Face} from 'react-native-vision-camera-face-detector';
import {
  OPEN_EYE_PROBABILITY_THRESHOLD,
  EYECLOSURE_TIME_THRESHOLD,
  BLINK_COUNT_THRESHOLD_LOW,
  BLINK_COUNT_THRESHOLD_HIGH,
} from '../constants/thresholds';
import {useLookAwayDetection} from './useLookAwayDetection';

export const useDrowsinessDetection = () => {
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

  const recordBlink = () => {
    const now = Date.now();
    blinkTimestampsRef.current = blinkTimestampsRef.current.filter(
      timestamp => now - timestamp <= 60000,
    );
    blinkTimestampsRef.current.push(now);
  };

  const calculateMovingAverage = (triggerAlert: () => Promise<void>) => {
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

  const checkDrowsiness = (face: Face, triggerAlert: () => Promise<void>) => {
    if (pitchAngleStatus !== 'center') return;

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
      } else if (Date.now() - startTimeDrowsinessRef.current > EYECLOSURE_TIME_THRESHOLD) {
        startTimeDrowsinessRef.current = null;
        triggerAlert();
        console.log('Eye closure time threshold exceeded');
      }
    } else {
      blinkStatusRef.current = 'open';
      startTimeDrowsinessRef.current = null;
    }

    // Checking blink count threshold
    if (blinkStatusRef.current === 'closed' && !blinkRegisteredRef.current) {
      recordBlink();
      blinkRegisteredRef.current = true;
    }

    calculateMovingAverage(triggerAlert);
  };

  return {
    leftEyeStatus,
    rightEyeStatus,
    eyeBlinkRate: eyeBlinkRateRef.current,
    eyeBlinkRateData: blinkCountsPer30SecRef.current.toString(),
    checkDrowsiness,
  };
};
