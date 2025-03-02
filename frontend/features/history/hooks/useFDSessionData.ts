// import {useState, useEffect} from 'react';
// import {FDSessionType} from '@/types/FDSessionType';
// import {FDSessionService} from '@/services/FDSessionService';
// import {DisplayModeType} from '@/features/history/types/DisplayModeType';

// export const useFDSessionData = (displayMode: DisplayModeType, startDate: Date) => {
//   const [data, setData] = useState<FDSessionType[]>([]);
//   const [loading, setLoading] = useState(true);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const data = await FDSessionService.getAllFDSessions();
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

//   return {fd_data: data, loading};
// };
