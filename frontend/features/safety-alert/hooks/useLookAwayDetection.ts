import {useState, useRef} from 'react';
import {Face} from 'react-native-vision-camera-face-detector';
import {
  PITCH_DOWN_ANGLE_THRESHOLD,
  PITCH_UP_ANGLE_THRESHOLD,
  LOOKDOWN_TIME_THRESHOLD,
} from '@/features/safety-alert/constants/thresholds';

export const useLookAwayDetection = () => {
  const [pitchAngleStatus, setPitchAngleStatus] = useState<'up' | 'center' | 'down'>('center');
  const startTimeRef = useRef<number | null>(null);

  const checkLookingAway = (face: Face, triggerAlert: () => Promise<void>) => {
    const isLookingDown = face.pitchAngle < PITCH_DOWN_ANGLE_THRESHOLD;
    const isLookingUp = face.pitchAngle > PITCH_UP_ANGLE_THRESHOLD;
    setPitchAngleStatus(isLookingUp ? 'up' : isLookingDown ? 'down' : 'center');

    if (pitchAngleStatus !== 'center') {
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      } else if (Date.now() - startTimeRef.current > LOOKDOWN_TIME_THRESHOLD) {
        triggerAlert();
        startTimeRef.current = null;
        console.log('Looking down time threshold exceeded');
      }
    } else {
      startTimeRef.current = null;
    }
  };

  return {pitchAngleStatus, checkLookingAway};
};
