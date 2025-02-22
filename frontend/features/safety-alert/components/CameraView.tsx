import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  useCameraPermission,
  useCameraDevice,
  Camera as VisionCamera,
} from 'react-native-vision-camera';
import FaceDetection from '@/features/safety-alert/components/FaceDetection';
import {Button, Icon} from '@rneui/themed';

type Props = {
  isCameraActive: boolean;
  setIsCameraActive: (active: boolean) => void;
};

export const CameraView = ({isCameraActive, setIsCameraActive}: Props) => {
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

  return isCameraActive ? (
    <FaceDetection device={device} />
  ) : (
    <View style={styles.container}>
      <Button
        titleStyle={styles.buttonText}
        buttonStyle={styles.roundButton}
        containerStyle={styles.roundButton}
        onPress={() => setIsCameraActive(true)}>
        <Icon name={'videocam'} color={'white'} size={50} />
        Start Detection
      </Button>
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
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
