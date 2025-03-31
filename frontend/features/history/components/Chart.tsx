import React, {useState, useEffect} from 'react';
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
  const [fontLoaded, setFontLoaded] = useState(false);
  const font = useFont(interFont, 12);
  const {state, isActive} = useChartPressState({x: 0, y: {alertPerHour: 0}});

  useEffect(() => {
    setFontLoaded(true);
  }, [font]);

  if (
    !Array.isArray(data) ||
    data.length === 0 ||
    !data.every(item => item && item.alertPerHour !== undefined && item.date)
  ) {
    return (
      <View style={styles.chartContainer}>
        <Text>No data available</Text>
      </View>
    );
  }

  const startDate = data[0]?.date || '';
  const indexedData = data.map((item, index) => ({
    ...item,
    index: displayMode === 'day' ? index : index + 1,
  }));
  const maxAlertPerHour = Math.max(...data.map(item => item.alertPerHour));

  return (
    <View style={styles.chartContainer}>
      {fontLoaded && (
        <CartesianChart
          chartPressState={state}
          data={indexedData}
          xKey="index"
          yKeys={['alertPerHour']}
          domainPadding={
            displayMode === 'day'
              ? {left: 10, right: 5, top: 70}
              : displayMode === 'week'
                ? {left: 25, right: 25, top: 70}
                : displayMode === 'month'
                  ? {left: 10, right: 5, top: 70}
                  : {left: 15, right: 15, top: 70}
          }
          axisOptions={{
            font,
            tickCount: data.length > 0 ? data.length : 0,
            formatXLabel(value) {
              if (value === undefined || value === null) {
                return '';
              }

              if (displayMode === 'day') {
                const timeLabels: {[key: number]: string} = {
                  0: '12AM',
                  6: '6AM',
                  12: '12PM',
                  18: '6PM',
                };
                return timeLabels[value] || '';
              } else if (displayMode === 'week') {
                const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                return daysOfWeek[(value - 1) % 7];
              } else if (displayMode === 'month') {
                return [1, 8, 15, 22].includes(value) ? value.toString() : '';
              } else if (displayMode === 'year') {
                const monthsOfYear = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
                return monthsOfYear[(value - 1) % 12];
              }
              return value.toString();
            },
          }}
          yAxis={[
            {
              font,
              axisSide: 'left',
              domain: [0, Math.min(maxAlertPerHour + 6, 500)],
            },
          ]}>
          {({points, chartBounds}) => (
            <View>
              <Bar
                chartBounds={chartBounds}
                points={points.alertPerHour}
                roundedCorners={{topLeft: 2, topRight: 2}}
                innerPadding={0.5}
                animate={{type: 'timing', duration: 500}}>
                <LinearGradient start={vec(0, 0)} end={vec(0, 150)} colors={['#1E3A8A']} />
              </Bar>
              {isActive && font && (
                <Tooltip
                  xCoordinate={state.x.position}
                  yCoordinate={state.y.alertPerHour.position}
                  date={state.x.value}
                  alertPerHour={state.y.alertPerHour.value}
                  startDate={startDate}
                  displayMode={displayMode}
                  maxAlertPerHour={maxAlertPerHour}
                />
              )}
            </View>
          )}
        </CartesianChart>
      )}
    </View>
  );
};

export default React.memo(Chart);

const styles = StyleSheet.create({
  chartContainer: {flex: 1},
});
