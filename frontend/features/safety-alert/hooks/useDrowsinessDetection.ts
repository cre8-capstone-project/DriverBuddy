import {useState, useRef, useEffect} from 'react';
import {Face} from 'react-native-vision-camera-face-detector';
import {
  OPEN_EYE_PROBABILITY_THRESHOLD,
  BLINK_DURATION_LONG_THRESHOLD,
  BLINK_MONITORING_DURATION_WINDOW,
  BLINK_COUNT_THRESHOLD_HIGH,
  BLINK_DURATION_MID_THRESHOLD,
  BLINK_COUNT_THRESHOLD,
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
  const blinkMidTimestampsRef = useRef<number[]>([]);

  const blinkStatusRef = useRef<'closed' | 'open'>('open');
  const blinkRegisteredRef = useRef<boolean>(false);
  const blinkMidRegisteredRef = useRef<boolean>(false);

  const eyeBlinkRateRef = useRef<number>(0);
  const eyeBlinkRateRef2 = useRef<number>(0);

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

  const recordMidBlink = () => {
    const now = Date.now();
    blinkMidTimestampsRef.current = blinkMidTimestampsRef.current.filter(
      timestamp => now - timestamp <= 60000,
    );
    blinkMidTimestampsRef.current.push(now);
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

      // Check unnatural blink 1
      eyeBlinkRateRef.current = blinkTimestampsRef.current.filter(
        timestamp => now - timestamp <= BLINK_MONITORING_DURATION_WINDOW,
      ).length;
      if (eyeBlinkRateRef.current >= BLINK_COUNT_THRESHOLD_HIGH) {
        if (pitchAngleStatus !== 'center' || alertStatus || instructionStatus) {
          blinkTimestampsRef.current = [];
          blinkMidTimestampsRef.current = [];
          return;
        }
        triggerAlert();
        setMessage('Unnatural Blink 1');
        blinkTimestampsRef.current = [];
        blinkMidTimestampsRef.current = [];
        startTimeDrowsinessRef.current = null;
      }

      // Check unnatural blink 2
      eyeBlinkRateRef2.current = blinkMidTimestampsRef.current.filter(
        timestamp => now - timestamp <= BLINK_MONITORING_DURATION_WINDOW,
      ).length;
      if (eyeBlinkRateRef2.current >= BLINK_COUNT_THRESHOLD) {
        if (pitchAngleStatus !== 'center' || alertStatus || instructionStatus) {
          blinkTimestampsRef.current = [];
          blinkMidTimestampsRef.current = [];
          return;
        }
        triggerAlert();
        setMessage('Unnatural Blink 2');
        blinkTimestampsRef.current = [];
        blinkMidTimestampsRef.current = [];
        startTimeDrowsinessRef.current = null;
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
        blinkMidRegisteredRef.current = false;
      }

      if (startTimeDrowsinessRef.current === null) {
        startTimeDrowsinessRef.current = Date.now();
      } else if (Date.now() - startTimeDrowsinessRef.current >= BLINK_DURATION_LONG_THRESHOLD) {
        // Skip if the driver is not looking straight or alerting
        if (pitchAngleStatus !== 'center' || alertStatus || instructionStatus) {
          startTimeDrowsinessRef.current = null;
          return;
        }
        triggerAlert();
        setMessage('Long Blink Duration');
        blinkTimestampsRef.current = [];
        startTimeDrowsinessRef.current = null;
      } else if (Date.now() - startTimeDrowsinessRef.current >= BLINK_DURATION_MID_THRESHOLD) {
        if (pitchAngleStatus !== 'center' || alertStatus || instructionStatus) {
          startTimeDrowsinessRef.current = null;
          return;
        }
        if (
          blinkStatusRef.current === 'closed' &&
          !blinkMidRegisteredRef.current &&
          !alertStatus &&
          !instructionStatus
        ) {
          recordMidBlink();
          blinkMidRegisteredRef.current = true;
        }
      }
    } else {
      blinkStatusRef.current = 'open';
      blinkRegisteredRef.current = true;
      startTimeDrowsinessRef.current = null;
    }

    // Record blink count
    if (
      blinkStatusRef.current === 'closed' &&
      !blinkRegisteredRef.current &&
      !alertStatus &&
      !instructionStatus
    ) {
      recordBlink();
      blinkRegisteredRef.current = true;
    }

    // Check Blink Rate
    calculateBlinkRate(triggerAlert);
  };

  return {
    leftEyeStatus,
    rightEyeStatus,
    eyeBlinkRate1: eyeBlinkRateRef.current,
    eyeBlinkRate2: eyeBlinkRateRef2.current,
    checkDrowsiness,
  };
};
