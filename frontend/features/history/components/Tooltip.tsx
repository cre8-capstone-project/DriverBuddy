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
};

export const Tooltip = ({
  xCoordinate,
  yCoordinate,
  date,
  alertPerHour,
  startDate,
  displayMode,
}: ToolTipProps) => {
  const font = useFont(interFont, 10);

  const lineStart = useDerivedValue(() => vec(xCoordinate.value, 30), [xCoordinate]);
  const lineEnd = useDerivedValue(
    () => vec(xCoordinate.value, yCoordinate.value),
    [xCoordinate, yCoordinate],
  );

  const xPosition = useDerivedValue(() => {
    return xCoordinate.value > screenWidth * 0.65 ? xCoordinate.value - 85 : xCoordinate.value + 5;
  }, [xCoordinate]);

  const xPositionForBg = useDerivedValue(() => {
    return xCoordinate.value > screenWidth * 0.65 ? xCoordinate.value - 89 : xCoordinate.value - 1;
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
      });
    }
  }, [date, startDate, displayMode]);

  const yValue = useDerivedValue(
    () => `${alertPerHour.value.toString()} alerts/hr`,
    [alertPerHour],
  );

  return (
    <View>
      <RoundedRect x={xPositionForBg} y={0} width={90} height={30} r={0} color="#1E3ABA" />
      <SkiaLine p1={lineStart} p2={lineEnd} strokeWidth={2} style="stroke" color="#1E3ABA" />
      <SkiaText x={xPosition} y={12} text={xValue} font={font} color="white" />
      <SkiaText x={xPosition} y={24} text={yValue} font={font} color="white" />
    </View>
  );
};
