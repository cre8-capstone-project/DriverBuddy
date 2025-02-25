import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  useCameraPermission,
  useCameraDevice,
  Camera as VisionCamera,
} from 'react-native-vision-camera';
import FaceDetection from '@/features/safety-alert/components/FaceDetection';
import {ConfirmationDialog} from '@/features/safety-alert/components/ConfirmationDialog';
import {Button, Icon} from '@rneui/themed';

type Props = {
  isFaceDetectionActive: boolean;
  setIsFaceDetectionActive: (active: boolean) => void;
};

export const CameraView = ({isFaceDetectionActive, setIsFaceDetectionActive}: Props) => {
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
    <FaceDetection device={device} />
  ) : (
    <View style={styles.container}>
      <Button
        titleStyle={styles.buttonText}
        buttonStyle={styles.roundButton}
        containerStyle={styles.roundButton}
        onPress={() => toggleDialog()}>
        <Icon name={'videocam'} color={'white'} size={50} />
        Start Detection
      </Button>

      <ConfirmationDialog
        dialogStatus={dialogStatus}
        toggleDialog={toggleDialog}
        setIsFaceDetectionActive={setIsFaceDetectionActive}
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
    color: 'white',
    fontWeight: 'bold',
  },
});
