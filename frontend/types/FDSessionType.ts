export type FDSessionType = {
  faceDetectionSessionId: string;
  userId: string;
  startTime?: string | null;
  endTime?: string | null;
  sessionDuration?: number | null;
  alerts?: string[];
};

export type FDSessionHistoryType = {
  totalSessionHours: number;
  totalNumberOfAlert: number;
  data: FDSessionHistoryDetailedType[];
};

export type FDSessionHistoryDetailedType = {
  date: string;
  totalSessionHours: number;
  totalNumberOfAlert: number;
  alertPerHour: number;
};
