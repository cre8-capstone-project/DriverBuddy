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
  const {data: hourlyData} = useChartData(viewMode, startDate);
  useEffect(() => {
    console.log('Hourly Alert Data:', JSON.stringify(hourlyData, null, 2));
  }, [hourlyData]);
  // --- Under development

  const legendItems = [
    {
      label: 'Alert received/hour',
      color: '#2089DC',
      description:
        'This is calculated by dividing the total daily alerts by the "Hours with Detection" for that day.',
    },
  ];

  return (
    <View style={styles.container}>
      <ViewModeButtons viewMode={viewMode} setViewMode={setViewMode} />
      <SummaryCard data={data} viewMode={viewMode} />
      <ChartPager viewMode={viewMode} startDate={startDate} setStartDate={setStartDate} />
      <Chart data={data} viewMode={viewMode} />
      <Legend legend={legendItems} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, gap: 20, padding: 20},
});
