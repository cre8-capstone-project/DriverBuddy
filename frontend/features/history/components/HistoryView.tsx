import {useState, useMemo} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {useChartData} from '@/features/history/hooks/useChartData';
import {ViewModeButtons} from '@/features/history/components/ViewModeButtons';
import {SummaryCard} from '@/features/history/components/SummaryCard';
import Chart from '@/features/history/components/Chart';
import {ChartPager} from '@/features/history/components/ChartPager';
import {Legend} from '@/features/history/components/Legend';
import {ViewMode} from '@/features/history/types/ViewMode';

export const HistoryView = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [startDate, setStartDate] = useState(() => {
    const startDate = new Date();
    // startDate.setDate(startDate.getDate() - startDate.getDay());
    startDate.setHours(0, 0, 0, 0);
    return startDate;
  });

  const {totalSessionHours, totalNumberOfAlert, detailedData, loading} = useChartData(
    viewMode,
    startDate,
  );

  // Note:
  // Memoize chartProps to prevent the component from re-rendering with outdated detailedData
  // when only viewMode updates, as detailedData updates are always delayed.
  const chartProps = useMemo(
    () => ({
      data: detailedData,
      viewMode: viewMode,
    }),
    [detailedData],
  );

  const legendItems = [
    {
      label: 'Alert received/hour',
      color: '#1E3A8A',
      description:
        'This is calculated by dividing the total daily alerts by the "Hours with Detection" for that day.',
    },
  ];

  return (
    <View style={styles.container}>
      <ViewModeButtons viewMode={viewMode} setViewMode={setViewMode} setStartDate={setStartDate} />
      <SummaryCard data={{totalSessionHours, totalNumberOfAlert}} />
      <ChartPager viewMode={viewMode} startDate={startDate} setStartDate={setStartDate} />
      {/* <Chart data={detailedData} viewMode={viewMode} /> */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <Chart {...chartProps} />
      )}
      <Legend legend={legendItems} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, gap: 20, padding: 20},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});
