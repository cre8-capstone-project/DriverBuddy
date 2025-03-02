import {useState, useEffect} from 'react';
import {DisplayModeType} from '@/features/history/types/DisplayModeType';
import type {FDSessionHistoryType, FDSessionHistoryDetailedType} from '@/types/FDSessionType';
import {
  getFaceDetectionHistoryDataByDay,
  getFaceDetectionHistoryDataByWeek,
  getFaceDetectionHistoryDataByMonth,
  getFaceDetectionHistoryDataByYear,
} from '@/api/api';

// TODO: For Offline mode (Get data from SQLite)
// import {FDSessionHistoryService} from '@/services/FDSessionHistoryService';

export const useChartData = (displayMode: DisplayModeType, startDate: Date) => {
  const [totalSessionHours, setTotalSessionHours] = useState(0);
  const [totalNumberOfAlert, setTotalNumberOfAlert] = useState(0);
  const [detailedData, setDetailedData] = useState<FDSessionHistoryDetailedType[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ToDo: Need to pass userID to API parameter
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let data: FDSessionHistoryType = {totalSessionHours: 0, totalNumberOfAlert: 0, data: []};

        if (displayMode === 'day') {
          // Retrieve data from cloud database
          data = await getFaceDetectionHistoryDataByDay('1', formatDate(startDate));

          // TODO: For Offline mode (Get data from SQLite)
          // data = await FDSessionHistoryService.getDataByDay(new Date(startDate));
        } else if (displayMode === 'week') {
          // Retrieve data from cloud database
          data = await getFaceDetectionHistoryDataByWeek('1', formatDate(startDate));

          // TODO: For Offline mode (Get data from SQLite)
          // data = await FDSessionHistoryService.getDataByWeek(new Date(startDate));
        } else if (displayMode === 'month') {
          // Retrieve data from cloud database
          data = await getFaceDetectionHistoryDataByMonth('1', formatDate(startDate));

          // TODO: For Offline mode (Get data from SQLite)
          // data = await FDSessionHistoryService.getDataByMonth(new Date(startDate));
        } else if (displayMode === 'year') {
          // Retrieve data from cloud database
          data = await getFaceDetectionHistoryDataByYear('1', formatDate(startDate));

          // TODO: For Offline mode (Get data from SQLite)
          // data = await FDSessionHistoryService.getDataByYear(new Date(startDate));
        }
        setTotalSessionHours(data.totalSessionHours);
        setTotalNumberOfAlert(data.totalNumberOfAlert);
        setDetailedData(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [displayMode, startDate]);

  return {totalSessionHours, totalNumberOfAlert, detailedData, loading};
};
