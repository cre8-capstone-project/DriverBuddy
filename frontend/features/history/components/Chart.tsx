// src/components/Chart.tsx
import {View, StyleSheet} from 'react-native';
import {CartesianChart, Bar, Line} from 'victory-native';
import {LinearGradient, vec} from '@shopify/react-native-skia';
import {useFont} from '@shopify/react-native-skia';

const interFont = require('@/assets/fonts/SpaceMono-Regular.ttf');

type Props = {
  data: {id: number; hours: number; alerts: number}[];
  viewMode: string;
};

export const Chart = ({data, viewMode}: Props) => {
  const font = useFont(interFont, 16);

  return (
    <View style={styles.chartContainer}>
      <CartesianChart
        data={data}
        xKey="id"
        yKeys={['hours', 'alerts']}
        domainPadding={
          viewMode === 'week'
            ? {left: 25, right: 25, top: 20}
            : viewMode === 'month'
              ? {left: 5, right: 5, top: 20}
              : {left: 15, right: 15, top: 20}
        }
        axisOptions={{
          font,
          tickCount: data.length,
          formatXLabel(value) {
            if (viewMode === 'week') {
              const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              return daysOfWeek[(value - 1) % 7];
            } else if (viewMode === 'month') {
              return [5, 10, 15, 20, 25, 30].includes(value) ? value.toString() : '';
            }
            return value.toString();
          },
        }}
        yAxis={[
          {
            yKeys: ['hours'],
            font,
            axisSide: 'left',
            domain: [0, 100],
            tickValues: [0, 50, 100],
            labelColor: 'green',
            enableRescaling: true,
          },
          {
            yKeys: ['alerts'],
            font,
            axisSide: 'right',
            domain: [0, 50],
            tickValues: [0, 10, 20, 30],
            labelColor: 'red',
            enableRescaling: true,
          },
        ]}>
        {({points, chartBounds}) => (
          <View>
            <Bar
              chartBounds={chartBounds}
              points={points.hours}
              animate={{type: 'timing', duration: 500}}>
              <LinearGradient start={vec(0, 0)} end={vec(0, 400)} colors={['#00a968', '#00a968']} />
            </Bar>
            <Line
              points={points.alerts}
              color="red"
              strokeWidth={2}
              animate={{type: 'timing', duration: 500}}
            />
          </View>
        )}
      </CartesianChart>
    </View>
  );
};

// Styles will be replaced after the visual design is ready
const styles = StyleSheet.create({
  chartContainer: {flex: 7},
});
