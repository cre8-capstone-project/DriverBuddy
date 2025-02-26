import {useState, useEffect} from 'react';
import {ViewMode} from '@/features/history/types/ViewMode';
import {HistoryService} from '@/services/HistoryService';
import type {HistoryData, DetailedData} from '@/types/HistoryDataType';

export const useChartData = (viewMode: ViewMode, startDate: Date) => {
  const [totalSessionHours, setTotalSessionHours] = useState(0);
  const [totalNumberOfAlert, setTotalNumberOfAlert] = useState(0);
  const [detailedData, setDtailedData] = useState<DetailedData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let data: HistoryData = {totalSessionHours: 0, totalNumberOfAlert: 0, data: []};

        if (viewMode === 'day') {
          data = await HistoryService.getDataByDay(new Date(startDate));
        } else if (viewMode === 'week') {
          data = await HistoryService.getDataByWeek(new Date(startDate));
        } else if (viewMode === 'month') {
          data = await HistoryService.getDataByMonth(new Date(startDate));
        } else if (viewMode === 'year') {
          data = await HistoryService.getDataByYear(new Date(startDate));
        }
        setTotalSessionHours(data.totalSessionHours);
        setTotalNumberOfAlert(data.totalNumberOfAlert);
        setDtailedData(data.data);
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
