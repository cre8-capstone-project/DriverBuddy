import {useState, useEffect} from 'react';
import {ViewMode} from '@/features/history/types/ViewMode';
import {AlertService} from '@/services/AlertService';
// import {getDriverByID, getAllHistoryFromDriver, getHistoryByID} from '@/api/api';

type DailyAlertPerHour = {
  hour: number;
  count: number;
};

type WeeklyAlertPerHour = {
  date: string;
  alertsPerHour: number;
};

type MonthlyAlertPerHour = {
  date: string;
  alertsPerHour: number;
};

type YearlyAlertPerHour = {
  date: string;
  alertsPerHour: number;
};

export const useChartData = (viewMode: ViewMode, startDate: Date) => {
  const [data, setData] = useState<WeeklyAlertPerHour[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await AlertService.getWeeklyAlertPerHour(startDate.toISOString());
      setData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [viewMode, startDate]);

  return {data, loading};
};

export const useChartDataDummy = (viewMode: ViewMode, startDate: Date) => {
  const maxHoursValues = {
    day: 2,
    week: 15,
    month: 15,
    year: 300,
  };
  const maxAlertValues = {
    day: 5,
    week: 5,
    month: 10,
    year: 100,
  };
  const maxHours = maxHoursValues[viewMode] || 0;
  const maxAlerts = maxAlertValues[viewMode] || 0;

  // Sample API calls
  // const userID = 'EupIJaWMSnitQnIIcWi7';
  // useEffect(() => {
  //   const loadData = async () => {
  //     console.log('Call API');
  //     const driver = await getDriverByID(userID);
  //     const driverHistory = await getAllHistoryFromDriver(userID);
  //     console.log(`Driver Name: ${driver?.name}`);
  //     console.log(`Driver History (All): ${JSON.stringify(driverHistory, null, 2)}`);
  //     const historyID = driverHistory[0]?.id || '';
  //     const singleHistoryDocument = await getHistoryByID(historyID);
  //     console.log(
  //       `Driver History (${historyID}): ${JSON.stringify(singleHistoryDocument, null, 2)}`,
  //     );
  //   };
  //   loadData();
  // }, []);

  return Array.from(
    {length: viewMode === 'day' ? 24 : viewMode === 'week' ? 7 : viewMode === 'month' ? 30 : 12},
    (_, index) => ({
      id: index + 1,
      hours: Math.floor(Math.random() * maxHours),
      alerts: Math.floor(Math.random() * maxAlerts),
    }),
  );
};
