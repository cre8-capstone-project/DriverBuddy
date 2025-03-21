export const OPEN_EYE_PROBABILITY_THRESHOLD = 0.7;
// Blink duration criteria
export const BLINK_DURATION_LONG_THRESHOLD = 1500;

// Unnatural blink behaviour criteria - common
export const BLINK_MONITORING_DURATION_WINDOW = 10000;
// Unnatural blink behaviour criteria - 1 (Normal-duration Blinks Count / Monitoring Duration Window)
export const BLINK_COUNT_THRESHOLD_LOW = 0;
export const BLINK_COUNT_THRESHOLD_HIGH = 10;
// Unnatural blink behaviour criteria - 2 (Mid-duration Blinks Count / Monitoring Duration Window)
export const BLINK_COUNT_THRESHOLD = 4;
export const BLINK_DURATION_MID_THRESHOLD = 500;

// Head tilt criteria
export const PITCH_DOWN_ANGLE_THRESHOLD = -5;
export const PITCH_UP_ANGLE_THRESHOLD = 15;
export const HEADTILT_DURATION_THRESHOLD = 5000;
