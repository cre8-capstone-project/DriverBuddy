export type FDSessionType = {
  faceDetectionSessionId: string;
  userId: string;
  startTime?: string;
  endTime?: string | null;
  sessionDuration?: number | null;
  sessionStartDate?: string | null;
  sessionEndDate?: string | null;
  sessionStartMonth?: string | null;
  sessionEndMonth?: string | null;
};
