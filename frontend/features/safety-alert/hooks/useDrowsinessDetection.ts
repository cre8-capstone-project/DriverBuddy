import {useState, useRef} from 'react';
import {Face} from 'react-native-vision-camera-face-detector';
import {
  OPEN_EYE_PROBABILITY_THRESHOLD,
  EYECLOSURE_TIME_THRESHOLD,
  BLINK_COUNT_THRESHOLD,
} from '../constants/thresholds';

export const useDrowsinessDetection = () => {
  const [leftEyeStatus, setLeftEyeStatus] = useState(false);
  const [rightEyeStatus, setRightEyeStatus] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);

  const startTimeDrowsinessRef = useRef<number | null>(null);
  const blinkTimestampsRef = useRef<number[]>([]);
  const blinkStatusRef = useRef<'closed' | 'open'>('open');
  const blinkRegisteredRef = useRef<boolean>(false);

  const recordBlink = () => {
    const now = Date.now();
    blinkTimestampsRef.current = blinkTimestampsRef.current.filter(
      timestamp => now - timestamp <= 60000,
    );
    blinkTimestampsRef.current.push(now);
    setBlinkCount(blinkTimestampsRef.current.length);
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
        blinkRegisteredRef.current = false;
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
      if (blinkTimestampsRef.current.length > BLINK_COUNT_THRESHOLD) {
        blinkTimestampsRef.current = [];
        triggerAlert();
        console.log('Blink count threshold exceeded');
      }
    }
  };

  return {leftEyeStatus, rightEyeStatus, blinkCount, checkDrowsiness};
};
