import {View, StyleSheet} from 'react-native';
import {CartesianChart, Bar, Line, useChartPressState} from 'victory-native';
import {LinearGradient, vec} from '@shopify/react-native-skia';
import {useFont} from '@shopify/react-native-skia';
import {Tooltip} from './Tooltip';

const interFont = require('@/assets/fonts/SpaceMono-Regular.ttf');

type Props = {
  data: {id: number; hours: number; alerts: number}[];
  viewMode: string;
};

export const Chart = ({data, viewMode}: Props) => {
  const font = useFont(interFont, 14);
  const {state, isActive} = useChartPressState({x: 0, y: {alerts: 0}});

  return (
    <View style={styles.chartContainer}>
      <CartesianChart
        chartPressState={state}
        data={data}
        xKey="id"
        yKeys={['alerts']}
        domainPadding={
          viewMode === 'day'
            ? {left: 5, right: 5, top: 50}
            : viewMode === 'week'
              ? {left: 25, right: 25, top: 50}
              : viewMode === 'month'
                ? {left: 5, right: 5, top: 50}
                : {left: 15, right: 15, top: 50}
        }
        axisOptions={{
          font,
          tickCount: data.length,
          formatXLabel(value) {
            if (viewMode === 'day') {
              return [3, 6, 9, 12, 15, 18, 21].includes(value) ? value.toString() : '';
            } else if (viewMode === 'week') {
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
            font,
            axisSide: 'left',
          },
        ]}>
        {({points, chartBounds}) => (
          <View>
            <Bar
              chartBounds={chartBounds}
              points={points.alerts}
              innerPadding={0.5}
              animate={{type: 'timing', duration: 500}}>
              <LinearGradient start={vec(0, 0)} end={vec(0, 400)} colors={['#2089DC', '#155FA2']} />
            </Bar>
            {/* <Line
              points={points.alerts}
              color="#FF758C"
              strokeWidth={3}
              animate={{type: 'timing', duration: 500}}
            /> */}
            {isActive && font && (
              <Tooltip
                xCoordinate={state.x.position}
                yCoordinate={state.y.alerts.position}
                date={state.x.value}
                hours={state.y.alerts.value}
              />
            )}
          </View>
        )}
      </CartesianChart>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {flex: 1},
});
