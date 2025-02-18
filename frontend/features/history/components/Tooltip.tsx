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
  hours: SharedValue<number>;
};

export const Tooltip = ({xCoordinate, yCoordinate, date, hours}: ToolTipProps) => {
  const font = useFont(interFont, 12);

  const lineStart = useDerivedValue(() => vec(xCoordinate.value, 35), [xCoordinate]);
  const lineEnd = useDerivedValue(
    () => vec(xCoordinate.value, yCoordinate.value),
    [xCoordinate, yCoordinate],
  );

  const xPosition = useDerivedValue(() => {
    return xCoordinate.value > screenWidth * 0.65 ? xCoordinate.value - 65 : xCoordinate.value + 5;
  }, [xCoordinate]);
  const xPositionForBg = useDerivedValue(() => {
    return xCoordinate.value > screenWidth * 0.65 ? xCoordinate.value - 69 : xCoordinate.value - 1;
  }, [xCoordinate]);

  const xValue = useDerivedValue(() => `Index:${date.value.toString()}`, [date]);
  const yValue = useDerivedValue(() => `${hours.value.toString()}hrs`, [hours]);

  return (
    <View>
      <RoundedRect x={xPositionForBg} y={0} width={70} height={43} r={0} color="#4A4A4A" />
      <SkiaLine p1={lineStart} p2={lineEnd} strokeWidth={2} style="stroke" color="#4A4A4A" />
      <SkiaText x={xPosition} y={18} text={xValue} font={font} color="white" />
      <SkiaText x={xPosition} y={35} text={yValue} font={font} color="white" />
    </View>
  );
};
