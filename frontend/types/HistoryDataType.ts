export type HistoryData = {
  totalSessionHours: number;
  totalNumberOfAlert: number;
  data: DetailedData[];
};

export type DetailedData = {
  date: string;
  totalSessionHours: number;
  totalNumberOfAlert: number;
  alertPerHour: number;
};
