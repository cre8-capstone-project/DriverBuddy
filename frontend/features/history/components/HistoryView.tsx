import {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {useChartData} from '@/features/history/hooks/useChartData';
import {ViewModeButtons} from '@/features/history/components/ViewModeButtons';
import {ReportCard} from '@/features/history/components/ReportCard';
import {Chart} from '@/features/history/components/Chart';
import {ChartPager} from '@/features/history/components/ChartPager';
import {Legend} from '@/features/history/components/Legend';

export const HistoryView = () => {
  const [viewMode, setViewMode] = useState('week');
  const [startDate, setStartDate] = useState(new Date());
  const data = useChartData(viewMode, startDate);

  const legendItems = [
    {label: 'Driving hours w/ detection', color: '#00C9FF'},
    {label: 'Driving hours w/o detection', color: '#00C9FF'},
    {label: 'Alerts received', color: '#FF758C'},
  ];

  return (
    <View style={styles.container}>
      <ViewModeButtons viewMode={viewMode} setViewMode={setViewMode} />
      <ReportCard data={data} viewMode={viewMode} />
      <ChartPager viewMode={viewMode} startDate={startDate} setStartDate={setStartDate} />
      <Chart data={data} viewMode={viewMode} />
      <Legend legend={legendItems} />
    </View>
  );
};

// Styles will be replaced after the visual design is ready
const styles = StyleSheet.create({
  container: {flex: 1, gap: 10, padding: 10},
});
