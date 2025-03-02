// import {useState, useEffect} from 'react';
// import {AlertType} from '@/types/AlertType';
// import {AlertService} from '@/services/AlertService';
// import {DisplayModeType} from '@/features/history/types/DisplayModeType';

// export const useAlertData = (displayMode: DisplayModeType, startDate: Date) => {
//   const [data, setData] = useState<AlertType[]>([]);
//   const [loading, setLoading] = useState(true);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const data = await AlertService.getAllAlerts();
//       setData(data);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [displayMode, startDate]);

//   return {alert_data: data, loading};
// };
