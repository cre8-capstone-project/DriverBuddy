import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {CartesianChart, Bar, useChartPressState} from 'victory-native';
import {LinearGradient, vec} from '@shopify/react-native-skia';
import {useFont} from '@shopify/react-native-skia';
import {Tooltip} from './Tooltip';
import type {FDSessionHistoryDetailedType} from '@/types/FDSessionType';
import type {DisplayModeType} from '@/features/history/types/DisplayModeType';

const interFont = require('@/assets/fonts/SpaceMono-Regular.ttf');

type Props = {
  data: FDSessionHistoryDetailedType[];
  displayMode: DisplayModeType;
};

const Chart = ({data, displayMode}: Props) => {
  const font = useFont(interFont, 14);
  const {state, isActive} = useChartPressState({x: 0, y: {alertPerHour: 0}});

  if (data.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text>No data available</Text>
      </View>
    );
  }

  const startDate = data[0].date;

  const indexedData = data.map((item, index) => ({
    ...item,
    index: displayMode === 'day' ? index : index + 1,
  }));

  const maxAlertPerHour = Math.max(...data.map(item => item.alertPerHour));

  return (
    <View style={styles.chartContainer}>
      <CartesianChart
        chartPressState={state}
        data={indexedData}
        xKey="index"
        yKeys={['alertPerHour']}
        domainPadding={
          displayMode === 'day'
            ? {left: 5, right: 5, top: 50}
            : displayMode === 'week'
              ? {left: 25, right: 25, top: 50}
              : displayMode === 'month'
                ? {left: 5, right: 5, top: 50}
                : {left: 15, right: 15, top: 50}
        }
        axisOptions={{
          font,
          tickCount: data.length,
          formatXLabel(value) {
            if (displayMode === 'day') {
              return [0, 3, 6, 9, 12, 15, 18, 21].includes(value) ? value.toString() : '';
            } else if (displayMode === 'week') {
              const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              return daysOfWeek[(value - 1) % 7];
            } else if (displayMode === 'month') {
              return [5, 10, 15, 20, 25, 30].includes(value) ? value.toString() : '';
            }
            return value.toString();
          },
        }}
        yAxis={[
          {
            font,
            axisSide: 'left',
            domain: [0, maxAlertPerHour + 5],
          },
        ]}>
        {({points, chartBounds}) => (
          <View>
            <Bar
              chartBounds={chartBounds}
              points={points.alertPerHour}
              innerPadding={0.5}
              animate={{type: 'timing', duration: 500}}>
              <LinearGradient start={vec(0, 0)} end={vec(0, 400)} colors={['#1E3A8A', '#00FFFF']} />
            </Bar>
            {isActive && font && (
              <Tooltip
                xCoordinate={state.x.position}
                yCoordinate={state.y.alertPerHour.position}
                date={state.x.value}
                alertPerHour={state.y.alertPerHour.value}
                startDate={startDate}
                displayMode={displayMode}
              />
            )}
          </View>
        )}
      </CartesianChart>
    </View>
  );
};

export default React.memo(Chart);

const styles = StyleSheet.create({
  chartContainer: {flex: 1},
});
