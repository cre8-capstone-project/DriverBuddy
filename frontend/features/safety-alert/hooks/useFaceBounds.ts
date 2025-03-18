import {useEffect} from 'react';
import {useSharedValue, useAnimatedStyle, withTiming, runOnJS} from 'react-native-reanimated';
import {useFaceDetectionContext} from '@/contexts/FaceDetectionProvider';

export const useFaceBounds = () => {
  const {viewModeContext, alertStatus} = useFaceDetectionContext();
  const aFaceW = useSharedValue(0);
  const aFaceH = useSharedValue(0);
  const aFaceX = useSharedValue(0);
  const aFaceY = useSharedValue(0);
  const borderWidth = useSharedValue(4);
  const borderColor = useSharedValue('lightgreen');

  useEffect(() => {
    runOnJS(() => {
      borderColor.value = alertStatus ? '#FF4B4B' : 'lightgreen';
    })();
  }, [alertStatus]);

  const faceBorderStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    borderWidth: borderWidth.value,
    borderColor: borderColor.value,
    width: withTiming(aFaceW.value, {duration: 100}),
    height: withTiming(aFaceH.value, {duration: 100}),
    left: withTiming(aFaceX.value, {duration: 100}),
    top: withTiming(aFaceY.value, {duration: 100}),
  }));

  const updateFaceBounds = (face?: any) => {
    const PADDING = 25;
    if (face) {
      const {width, height, x, y} = face.bounds;
      aFaceW.value = width + PADDING * 2;
      aFaceH.value =
        viewModeContext === 'mapView' ? (height + PADDING * 2) * 0.8 : (height + PADDING * 2) * 0.8;
      aFaceX.value = x - PADDING + 10;
      aFaceY.value = y - PADDING;
    } else {
      aFaceW.value = aFaceH.value = aFaceX.value = aFaceY.value = 0;
    }
  };

  const showFaceBorder = () => (borderWidth.value = 4);
  const hideFaceBorder = () => (borderWidth.value = 0);

  return {faceBorderStyle, updateFaceBounds, showFaceBorder, hideFaceBorder};
};
