import React, {useEffect} from 'react';
import {Text} from 'react-native';
import {
  useCameraPermission,
  useCameraDevice,
  Camera as VisionCamera,
} from 'react-native-vision-camera';
import FaceDetection from '@/features/safety-alert/components/FaceDetection';
import type {ViewModeType} from '@/types/ViewModeType';

type Props = {
  isFaceDetectionActive: boolean;
  setIsFaceDetectionActive: (active: boolean) => void;
  setViewMode: (mode: ViewModeType) => void;
  viewMode: ViewModeType;
};

export const CameraView = ({isFaceDetectionActive, viewMode}: Props) => {
  const {hasPermission} = useCameraPermission();
  const device = useCameraDevice('front');

  useEffect(() => {
    (async () => {
      const status = await VisionCamera.requestCameraPermission();
      console.log(`Camera permission: ${status}`);
    })();
  }, [device]);

  if (!hasPermission) return <Text>Permission Error</Text>;
  if (!device) return <Text>Device Not Found Error</Text>;

  return isFaceDetectionActive ? <FaceDetection device={device} viewMode={viewMode} /> : null;
};
