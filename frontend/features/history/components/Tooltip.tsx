import {View, Dimensions} from 'react-native';
import {vec} from '@shopify/react-native-skia';
import {useFont, RoundedRect, Text as SkiaText, Line as SkiaLine} from '@shopify/react-native-skia';
import {SharedValue, useDerivedValue} from 'react-native-reanimated';

const interFont = require('@/assets/fonts/SpaceMono-Regular.ttf');
const screenWidth = Dimensions.get('window').width;

type ToolTipProps = {
  xCoordinate: SharedValue<number>;
  yCoordinate: SharedValue<number>;
  date: SharedValue<number>;
  alertPerHour: SharedValue<number>;
  startDate: string;
  viewMode: string;
};

export const Tooltip = ({
  xCoordinate,
  yCoordinate,
  date,
  alertPerHour,
  startDate,
  viewMode,
}: ToolTipProps) => {
  const font = useFont(interFont, 10);

  const lineStart = useDerivedValue(() => vec(xCoordinate.value, 30), [xCoordinate]);
  const lineEnd = useDerivedValue(
    () => vec(xCoordinate.value, yCoordinate.value),
    [xCoordinate, yCoordinate],
  );

  const xPosition = useDerivedValue(() => {
    return xCoordinate.value > screenWidth * 0.65 ? xCoordinate.value - 80 : xCoordinate.value + 5;
  }, [xCoordinate]);

  const xPositionForBg = useDerivedValue(() => {
    return xCoordinate.value > screenWidth * 0.65 ? xCoordinate.value - 84 : xCoordinate.value - 1;
  }, [xCoordinate]);

  // const xValue = useDerivedValue(() => `${date.value.toString()}`, [date]);
  const xValue = useDerivedValue(() => {
    const updatedDate = new Date(startDate);

    if (viewMode === 'year') {
      updatedDate.setMonth(updatedDate.getMonth() + Number(date.value));
      return updatedDate.toLocaleDateString('en-US', {
        month: 'short',
      });
    } else if (viewMode === 'day') {
      updatedDate.setHours(Number(date.value));
      return updatedDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } else {
      updatedDate.setDate(updatedDate.getDate() + Number(date.value));
      return updatedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
      });
    }
  }, [date, startDate, viewMode]);

  const yValue = useDerivedValue(
    () => `${alertPerHour.value.toString()} alerts/hr`,
    [alertPerHour],
  );

  return (
    <View>
      <RoundedRect x={xPositionForBg} y={0} width={85} height={30} r={0} color="#1E3ABA" />
      <SkiaLine p1={lineStart} p2={lineEnd} strokeWidth={2} style="stroke" color="#1E3ABA" />
      <SkiaText x={xPosition} y={12} text={xValue} font={font} color="white" />
      <SkiaText x={xPosition} y={24} text={yValue} font={font} color="white" />
    </View>
  );
};
