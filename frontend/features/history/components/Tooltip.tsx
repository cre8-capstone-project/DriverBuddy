import {View, Dimensions} from 'react-native';
import {vec} from '@shopify/react-native-skia';
import {useFont, Text as SkiaText, Line as SkiaLine} from '@shopify/react-native-skia';
import {SharedValue, useDerivedValue} from 'react-native-reanimated';

const interFont = require('@/assets/fonts/SpaceMono-Regular.ttf');
const screenWidth = Dimensions.get('window').width;

type ToolTipProps = {
  xCoordinate: SharedValue<number>;
  yCoordinate: SharedValue<number>;
  date: SharedValue<number>;
  hours: SharedValue<number>;
};

export const Tooltip = ({xCoordinate, yCoordinate, date, hours}: ToolTipProps) => {
  const font = useFont(interFont, 14);
  const lineStart = useDerivedValue(() => vec(xCoordinate.value, 0), [xCoordinate]);
  const lineEnd = useDerivedValue(() => vec(xCoordinate.value, 999), [xCoordinate]);

  const xPosition = useDerivedValue(() => {
    return xCoordinate.value > screenWidth * 0.7 ? xCoordinate.value - 75 : xCoordinate.value + 3;
  }, [xCoordinate]);

  const xValue = useDerivedValue(() => `Index:${date.value.toString()}`, [date]);
  const yValue = useDerivedValue(() => `${hours.value.toString()}hrs`, [hours]);

  return (
    <View>
      <SkiaLine p1={lineStart} p2={lineEnd} strokeWidth={2} style="stroke" color="gray" />
      <SkiaText x={xPosition} y={20} text={xValue} font={font} color="black" />
      <SkiaText x={xPosition} y={35} text={yValue} font={font} color="black" />
    </View>
  );
};
