import {useState, useEffect} from 'react';
import {FDSessionType} from '../../../types/FDSessionType';
import {FDSessionService} from '../../../services/FDSessionService';
import {ViewMode} from '../types/ViewMode';

export const useFDSessionData = (viewMode: ViewMode, startDate: Date) => {
  const [data, setData] = useState<FDSessionType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await FDSessionService.getAllFDSessions();
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

  return {fd_data: data, loading};
};
