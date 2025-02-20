import {useState, useEffect} from 'react';
import {AlertType} from '@/features/history/types/AlertType';
import {AlertService} from '@/features/history/services/AlertService';
import {ViewMode} from '@/features/history/types/ViewMode';

export const useAlertData = (viewMode: ViewMode, startDate: Date) => {
  const [data, setData] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await AlertService.getAllAlerts();
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

  return {alert_data: data, loading};
};
