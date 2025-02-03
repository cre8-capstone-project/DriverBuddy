import React, {useEffect} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {
  useCameraPermission,
  useCameraDevice,
  Camera as VisionCamera,
} from 'react-native-vision-camera';
import CameraView from '@/features/safety-alert/components/CameraView';

function App() {
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

  return (
    <View style={styles.container}>
      <CameraView device={device} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
});

export default App;
