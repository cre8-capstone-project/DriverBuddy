import {useSharedValue, useAnimatedStyle, withTiming} from 'react-native-reanimated';

export const useFaceBounds = () => {
  const aFaceW = useSharedValue(0);
  const aFaceH = useSharedValue(0);
  const aFaceX = useSharedValue(0);
  const aFaceY = useSharedValue(0);
  const borderWidth = useSharedValue(4);

  const faceBorderStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    borderWidth: borderWidth.value,
    borderColor: 'lightgreen',
    width: withTiming(aFaceW.value, {duration: 100}),
    height: withTiming(aFaceH.value, {duration: 100}),
    left: withTiming(aFaceX.value, {duration: 100}),
    top: withTiming(aFaceY.value, {duration: 100}),
  }));

  const updateFaceBounds = (face?: any) => {
    const PADDING = 10;
    if (face) {
      const {width, height, x, y} = face.bounds;
      aFaceW.value = width + PADDING * 2;
      aFaceH.value = height + PADDING * 2;
      aFaceX.value = x - PADDING;
      aFaceY.value = y - PADDING;
    } else {
      aFaceW.value = aFaceH.value = aFaceX.value = aFaceY.value = 0;
    }
  };

  const showFaceBorder = () => (borderWidth.value = 2);
  const hideFaceBorder = () => (borderWidth.value = 0);

  return {faceBorderStyle, updateFaceBounds, showFaceBorder, hideFaceBorder};
};
