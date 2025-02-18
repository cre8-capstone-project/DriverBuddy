import {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {useChartData} from '@/features/history/hooks/useChartData';
import {ViewModeButtons} from '@/features/history/components/ViewModeButtons';
import {ReportCard} from '@/features/history/components/ReportCard';
import {Chart} from '@/features/history/components/Chart';
import {ChartPager} from '@/features/history/components/ChartPager';
import {getDriverByID, getAllHistoryFromDriver, getHistoryByID} from '@/api/api';

const App = () => {
  const [viewMode, setViewMode] = useState('week');
  const [startDate, setStartDate] = useState(new Date());
  const data = useChartData(viewMode, startDate);
  const userID = 'EupIJaWMSnitQnIIcWi7'; //this id refers to the Vin Souza driver under 'driver' collection. Replace this with the id of the driver currently using the app

  useEffect(() => {
    const loadData = async () => {
      const driver = await getDriverByID(userID); //
      const driverHistory = await getAllHistoryFromDriver(userID);
      console.log('Driver info: ');
      console.log(driver);
      console.log('Driver History: ');
      console.log(driverHistory);
      const historyID = driverHistory[0]?.id || '';
      const singleHistoryDocument = await getHistoryByID(historyID);
      console.log('Single Driver History: ');
      console.log(singleHistoryDocument);
    };
    loadData();
  }, []);

  return (
    <View style={styles.container}>
      <ViewModeButtons viewMode={viewMode} setViewMode={setViewMode} />
      <ReportCard viewMode={viewMode} />
      <ChartPager viewMode={viewMode} startDate={startDate} setStartDate={setStartDate} />
      <Chart data={data} viewMode={viewMode} />
    </View>
  );
};

// Styles will be replaced after the visual design is ready
const styles = StyleSheet.create({
  container: {flex: 1, gap: 20, padding: 15, marginTop: 20},
});

export default App;
