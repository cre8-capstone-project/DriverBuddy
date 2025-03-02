export type FDSessionType = {
  faceDetectionSessionId: string;
  userId: string;
  startTime?: string | null;
  endTime?: string | null;
  sessionDuration?: number | null;
};

export type FDSessionDataType = {
  faceDetectionSessionId: string;
  userId: string;
  startTime: string;
  endTime: string;
  sessionDuration: number;
  alerts?: string[];
};
