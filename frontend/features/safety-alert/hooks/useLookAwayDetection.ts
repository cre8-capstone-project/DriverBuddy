import {useState, useRef} from 'react';
import {Face} from 'react-native-vision-camera-face-detector';
import {
  PITCH_DOWN_ANGLE_THRESHOLD,
  PITCH_UP_ANGLE_THRESHOLD,
  HEADTILT_DURATION_THRESHOLD,
} from '@/features/safety-alert/constants/thresholds';
import {useFaceDetectionContext} from '@/contexts/FaceDetectionProvider';

export const useLookAwayDetection = () => {
  const {setMessage, alertStatus, instructionStatus} = useFaceDetectionContext();
  const [pitchAngleStatus, setPitchAngleStatus] = useState<'up' | 'center' | 'down'>('center');
  const startTimeRef = useRef<number | null>(null);

  const checkLookingAway = (face: Face, triggerWarning: () => Promise<void>) => {
    const isLookingDown = face.pitchAngle < PITCH_DOWN_ANGLE_THRESHOLD;
    const isLookingUp = face.pitchAngle > PITCH_UP_ANGLE_THRESHOLD;
    setPitchAngleStatus(isLookingUp ? 'up' : isLookingDown ? 'down' : 'center');

    if (pitchAngleStatus !== 'center') {
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      } else if (Date.now() - startTimeRef.current > HEADTILT_DURATION_THRESHOLD) {
        if (alertStatus || instructionStatus) {
          return;
        }
        triggerWarning();
        startTimeRef.current = null;
        setMessage('Head Tilt');
      }
    } else {
      startTimeRef.current = null;
    }
  };

  return {pitchAngleStatus, checkLookingAway};
};
