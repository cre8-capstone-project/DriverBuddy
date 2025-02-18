import {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {useChartData} from '@/features/history/hooks/useChartData';
import {ViewModeButtons} from '@/features/history/components/ViewModeButtons';
import {SummaryCard} from '@/features/history/components/SummaryCard';
import {Chart} from '@/features/history/components/Chart';
import {ChartPager} from '@/features/history/components/ChartPager';
import {Legend} from '@/features/history/components/Legend';

type viewMode = 'day' | 'week' | 'month' | 'year';

export const HistoryView = () => {
  const [viewMode, setViewMode] = useState<viewMode>('week');
  const [startDate, setStartDate] = useState(new Date());
  const data = useChartData(viewMode, startDate);

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
