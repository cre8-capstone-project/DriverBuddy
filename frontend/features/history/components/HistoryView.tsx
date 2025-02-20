import {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {useChartDataDummy, useChartData} from '@/features/history/hooks/useChartData';
import {ViewModeButtons} from '@/features/history/components/ViewModeButtons';
import {SummaryCard} from '@/features/history/components/SummaryCard';
import {Chart} from '@/features/history/components/Chart';
import {ChartPager} from '@/features/history/components/ChartPager';
import {Legend} from '@/features/history/components/Legend';
import {ViewMode} from '@/features/history/types/ViewMode';

export const HistoryView = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [startDate, setStartDate] = useState(new Date());
  const data = useChartDataDummy(viewMode, startDate);

  // --- Under development
  const {alert_data, fd_data} = useChartData(viewMode, startDate);
  useEffect(() => {
    console.log('Alert data:', JSON.stringify(alert_data, null, 2));
    console.log('FD Session data:', JSON.stringify(fd_data, null, 2));
  }, [alert_data, fd_data]);
  // --- Under development

  const legendItems = [
    {label: 'Legend1 TBD', color: '#00C9FF'},
    {label: 'Legend2 TBD', color: '#FF758C'},
  ];

  return (
    <View style={styles.container}>
      <ViewModeButtons viewMode={viewMode} setViewMode={setViewMode} />
      <SummaryCard data={data} viewMode={viewMode} />
      <ChartPager viewMode={viewMode} startDate={startDate} setStartDate={setStartDate} />
      {viewMode !== 'day' && <Chart data={data} viewMode={viewMode} />}
      {viewMode !== 'day' && <Legend legend={legendItems} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, gap: 10, padding: 10},
});
