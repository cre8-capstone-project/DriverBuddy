import React from 'react';
import {View, Dimensions} from 'react-native';
import {vec} from '@shopify/react-native-skia';
import {useFont, RoundedRect, Text as SkiaText, Line as SkiaLine} from '@shopify/react-native-skia';
import {SharedValue, useDerivedValue} from 'react-native-reanimated';
import type {DisplayModeType} from '../types/DisplayModeType';

const interFont = require('@/assets/fonts/SpaceMono-Regular.ttf');
const screenWidth = Dimensions.get('window').width;

type ToolTipProps = {
  xCoordinate: SharedValue<number>;
  yCoordinate: SharedValue<number>;
  date: SharedValue<number>;
  alertPerHour: SharedValue<number>;
  startDate: string;
  displayMode: DisplayModeType;
  maxAlertPerHour: number;
};

export const Tooltip = ({
  xCoordinate,
  yCoordinate,
  date,
  alertPerHour,
  startDate,
  displayMode,
  maxAlertPerHour,
}: ToolTipProps) => {
  // useEffect(() => {
  //   console.log('[DEBUG] Tooltip is mounted');
  //   return () => {
  //     console.log('[DEBUG] Tooltip is unmounted');
  //   };
  // }, []);

  const font = useFont(interFont, 10);
  const tooltipWidth = 120;
  const tooltipHeight = 30;

  const lineStart = useDerivedValue(() => vec(xCoordinate.value, 30), [xCoordinate]);
  const lineEnd = useDerivedValue(
    () => vec(xCoordinate.value, yCoordinate.value),
    [xCoordinate, yCoordinate],
  );

  const xPosition = useDerivedValue(() => {
    const position = xCoordinate.value - tooltipWidth / 2;
    if (maxAlertPerHour < 10 && position < 18) {
      return 18 + 5;
    } else if (maxAlertPerHour >= 500 && position < 40) {
      return 33 + 5;
    } else if (maxAlertPerHour >= 50 && position < 35) {
      return 25 + 5;
    } else if (maxAlertPerHour >= 10 && position < 20) {
      return 20 + 5;
    } else if (position + tooltipWidth + 40 > screenWidth) {
      return screenWidth - tooltipWidth - 40 + 5;
    } else {
      return position + 5;
    }
  }, [xCoordinate]);

  const xPositionForBg = useDerivedValue(() => {
    const position = xCoordinate.value - tooltipWidth / 2;
    if (maxAlertPerHour < 10 && position < 18) {
      return 18;
    } else if (maxAlertPerHour >= 500 && position < 40) {
      return 33;
    } else if (maxAlertPerHour >= 50 && position < 35) {
      return 25;
    } else if (maxAlertPerHour >= 10 && position < 20) {
      return 20;
    } else if (position + tooltipWidth + 40 > screenWidth) {
      return screenWidth - tooltipWidth - 40;
    } else {
      return position;
    }
  }, [xCoordinate]);

  const xValue = useDerivedValue(() => {
    const updatedDate = new Date(startDate + 'T00:00:00');

    if (displayMode === 'year') {
      updatedDate.setMonth(updatedDate.getMonth() + Number(date.value) - 1);
      return updatedDate.toLocaleDateString('en-US', {
        month: 'short',
      });
    } else if (displayMode === 'day') {
      const hourValue = String(Number(date.value)).padStart(2, '0');
      return `${hourValue}:00`;
    } else {
      updatedDate.setDate(updatedDate.getDate() + Number(date.value) - 1);
      return updatedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });
    }
  }, [date, startDate, displayMode]);

  const yValue = useDerivedValue(
    () => `${alertPerHour.value.toString()} alerts/hr`,
    [alertPerHour],
  );

  if (!font || !xPosition || !xPositionForBg || !xValue || !yValue) {
    return null;
  }

  return (
    <View>
      <RoundedRect
        x={xPositionForBg}
        y={0}
        width={tooltipWidth}
        height={tooltipHeight}
        r={5}
        color="#1E3A8A"
      />
      <SkiaLine p1={lineStart} p2={lineEnd} strokeWidth={2} style="stroke" color="#1E3A8A" />
      <SkiaText x={xPosition} y={24} text={xValue} font={font} color="white" />
      <SkiaText x={xPosition} y={12} text={yValue} font={font} color="white" />
    </View>
  );
};
