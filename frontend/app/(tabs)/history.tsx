// src/App.tsx
import {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {useChartData} from '@/features/history/hooks/useChartData';
import {ViewModeButtons} from '@/features/history/components/ViewModeButtons';
import {ReportCard} from '@/features/history/components/ReportCard';
import {Chart} from '@/features/history/components/Chart';

const App = () => {
  const [viewMode, setViewMode] = useState('week');
  const data = useChartData(viewMode);

  return (
    <View style={styles.container}>
      <ViewModeButtons viewMode={viewMode} setViewMode={setViewMode} />
      <ReportCard viewMode={viewMode} />
      <Chart data={data} viewMode={viewMode} />
    </View>
  );
};

// Styles will be replaced after the visual design is ready
const styles = StyleSheet.create({
  container: {flex: 1, gap: 20, padding: 15, marginTop: 20},
});

export default App;
