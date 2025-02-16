import React, {useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  useCameraPermission,
  useCameraDevice,
  Camera as VisionCamera,
} from 'react-native-vision-camera';
import FaceDetection from '@/features/safety-alert/components/FaceDetection';
import {Button} from '@rneui/themed';

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
      console.log({status});
    })();
  }, [device]);

  if (!hasPermission) return <Text>Permission Error</Text>;
  if (!device) return <Text>Device Not Found Error</Text>;

  return isCameraActive ? (
    <FaceDetection device={device} />
  ) : (
    <View style={styles.container}>
      <Button
        title="Start Detection"
        titleStyle={styles.buttonText}
        buttonStyle={styles.roundButton}
        containerStyle={styles.roundButton}
        onPress={() => setIsCameraActive(true)}
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
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
