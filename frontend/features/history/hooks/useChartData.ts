import {ViewMode} from '@/features/history/types/ViewMode';
import {useAlertData} from '@/features/history/hooks/useAlertData';
import {useFDSessionData} from '@/features/history/hooks/useFDSessionData';
// import {getDriverByID, getAllHistoryFromDriver, getHistoryByID} from '@/api/api';

export const useChartData = (viewMode: ViewMode, startDate: Date) => {
  const {alert_data} = useAlertData(viewMode, startDate);
  const {fd_data} = useFDSessionData(viewMode, startDate);
  return {alert_data, fd_data};
};

export const useChartDataDummy = (viewMode: ViewMode, startDate: Date) => {
  // TODO:
  // This part will be replaced by fetching data through APIs
  // Now, it generates dummy data for sandbox

  const maxHoursValues = {
    day: 15,
    week: 15,
    month: 15,
    year: 300,
  };

  const maxAlertValues = {
    day: 5,
    week: 5,
    month: 5,
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
    {length: viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : viewMode === 'month' ? 30 : 12},
    (_, index) => ({
      id: index + 1,
      hours: Math.floor(Math.random() * maxHours),
      alerts: Math.floor(Math.random() * maxAlerts),
    }),
  );
};
