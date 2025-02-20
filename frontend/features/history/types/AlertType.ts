export type AlertType = {
  alertId: string;
  faceDetectionSessionId: string;
  userId: string;
  timestamp: string;
  alertMonth?: string | null;
  alertDate?: string | null;
};
