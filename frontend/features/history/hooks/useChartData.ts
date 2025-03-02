import {useState, useEffect} from 'react';
import {ViewMode} from '@/features/history/types/ViewMode';
// import {HistoryService} from '@/services/HistoryService';
import type {FDSessionHistoryData, DetailedData} from '@/types/FDSessionHistoryDataType';
import {
  getFaceDetectionHistoryDataByDay,
  getFaceDetectionHistoryDataByWeek,
  getFaceDetectionHistoryDataByMonth,
  getFaceDetectionHistoryDataByYear,
} from '@/api/api';

export const useChartData = (viewMode: ViewMode, startDate: Date) => {
  const [totalSessionHours, setTotalSessionHours] = useState(0);
  const [totalNumberOfAlert, setTotalNumberOfAlert] = useState(0);
  const [detailedData, setDetailedData] = useState<DetailedData[]>([]);
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
        let data: FDSessionHistoryData = {totalSessionHours: 0, totalNumberOfAlert: 0, data: []};

        if (viewMode === 'day') {
          // Retrieve data from cloud database
          data = await getFaceDetectionHistoryDataByDay('1', formatDate(startDate));
          // Retrieve data from local database
          // data = await HistoryService.getDataByDay(new Date(startDate));
        } else if (viewMode === 'week') {
          // Retrieve data from cloud database
          data = await getFaceDetectionHistoryDataByWeek('1', formatDate(startDate));
          // Retrieve data from local database
          // data = await HistoryService.getDataByWeek(new Date(startDate));
        } else if (viewMode === 'month') {
          // Retrieve data from cloud database
          data = await getFaceDetectionHistoryDataByMonth('1', formatDate(startDate));
          // Retrieve data from local database
          // data = await HistoryService.getDataByMonth(new Date(startDate));
        } else if (viewMode === 'year') {
          // Retrieve data from cloud database
          data = await getFaceDetectionHistoryDataByYear('1', formatDate(startDate));
          // Retrieve data from local database
          // data = await HistoryService.getDataByYear(new Date(startDate));
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
  }, [viewMode, startDate]);

  return {totalSessionHours, totalNumberOfAlert, detailedData, loading};
};
