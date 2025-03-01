import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  useCameraPermission,
  useCameraDevice,
  Camera as VisionCamera,
} from 'react-native-vision-camera';
import FaceDetection from '@/features/safety-alert/components/FaceDetection';
import {StartConfirmationDialog} from '@/features/safety-alert/components/StartConfirmationDialog';
import {Button, Icon} from '@rneui/themed';

type Props = {
  isFaceDetectionActive: boolean;
  setIsFaceDetectionActive: (active: boolean) => void;
  setViewMode: (mode: 'cameraView' | 'mapView') => void;
  viewMode: 'cameraView' | 'mapView';
};

export const CameraView = ({
  isFaceDetectionActive,
  setIsFaceDetectionActive,
  setViewMode,
  viewMode,
}: Props) => {
  const {hasPermission} = useCameraPermission();
  const [dialogStatus, setDialogStatus] = useState(false);
  const device = useCameraDevice('front');

  useEffect(() => {
    (async () => {
      const status = await VisionCamera.requestCameraPermission();
      console.log(`Camera permission: ${status}`);
    })();
  }, [device]);

  if (!hasPermission) return <Text>Permission Error</Text>;
  if (!device) return <Text>Device Not Found Error</Text>;

  const toggleDialog = () => {
    setDialogStatus(!dialogStatus);
  };

  return isFaceDetectionActive ? (
    <FaceDetection device={device} viewMode={viewMode} />
  ) : (
    <View style={styles.container}>
      <Button
        buttonStyle={styles.roundButton}
        containerStyle={styles.roundButton}
        onPress={() => {
          toggleDialog();
        }}>
        <Icon name={'videocam'} color={'white'} size={50} />
        <Text style={styles.buttonText}>Start your{'\n'}journey</Text>
      </Button>

      <StartConfirmationDialog
        dialogStatus={dialogStatus}
        toggleDialog={toggleDialog}
        setIsFaceDetectionActive={setIsFaceDetectionActive}
        setViewMode={setViewMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
