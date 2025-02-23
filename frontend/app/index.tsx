import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Text, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {CameraView} from '@/features/safety-alert/components/CameraView';
import {Map} from '@/app/map';
import {Button, Icon} from '@rneui/themed';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

type ViewMode = 'cameraView' | 'mapView';

type RootStackParamList = {
  settings: undefined;
  profile: undefined;
};

const {width, height} = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [viewMode, setViewMode] = useState<ViewMode>('cameraView');
  const [isFaceDetectionActive, setIsFaceDetectionActive] = useState(false);
  const [cameraKey, setCameraKey] = useState(0);

  useEffect(() => {
    setCameraKey(prevKey => prevKey + 1);
  }, [viewMode]);

  return (
    <View style={styles.container}>
      {/* Switch View Mode: Camera or Map */}
      <View
        style={[
          styles.componentContainer,
          // viewMode === 'cameraView' ? styles.visible : styles.hidden,
          viewMode === 'cameraView'
            ? styles.visible
            : isFaceDetectionActive
              ? styles.cameraPIP
              : styles.hidden,
        ]}>
        <CameraView
          key={cameraKey}
          isCameraActive={isFaceDetectionActive}
          setIsCameraActive={setIsFaceDetectionActive}
        />
      </View>
      <View
        style={[
          styles.componentContainer,
          viewMode === 'mapView' ? styles.visible : styles.hidden,
        ]}>
        <Map />
      </View>

      <View style={styles.navContainer}>
        {/* Back Button */}
        {viewMode === 'mapView' && (
          <Button
            type="clear"
            containerStyle={styles.backButtonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            iconPosition="top"
            icon={{name: 'west', size: 30, color: 'black'}}
            onPress={() => setViewMode('cameraView')}>
            <Text style={styles.buttonText}>Back</Text>
          </Button>
        )}

        {/* Setting Button */}
        {viewMode === 'cameraView' && !isFaceDetectionActive && (
          <Button
            type="clear"
            containerStyle={styles.navButtonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            iconPosition="top"
            icon={{name: 'settings', size: 30, color: 'black'}}
            onPress={() => navigation.navigate('settings')}>
            <Text style={styles.buttonText}>Settings</Text>
          </Button>
        )}

        {/* Turn Off Face Detection Button */}
        {isFaceDetectionActive && (
          <Button
            type="clear"
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            onPress={() => setIsFaceDetectionActive(false)}>
            <Icon name="videocam-off" size={30} color="black" />
            <Text style={styles.buttonText}>Turn off{'\n'}detection</Text>
          </Button>
        )}

        {/* Start Face Detection Button */}
        {viewMode === 'mapView' && !isFaceDetectionActive && (
          <Button
            type="clear"
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            onPress={() => setIsFaceDetectionActive(true)}>
            <Icon name="videocam" size={30} color="black" />
            <Text style={styles.buttonText}>Start{'\n'}detection</Text>
          </Button>
        )}

        {/* Map View Button */}
        {viewMode === 'cameraView' && (
          <Button
            type="outline"
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            onPress={() => setViewMode('mapView')}>
            <Icon name="location-on" size={30} color="black" />
            <Text style={styles.buttonText}>Map View</Text>
          </Button>
        )}

        {/* Profile Button */}
        {viewMode === 'cameraView' && !isFaceDetectionActive && (
          <Button
            type="clear"
            containerStyle={styles.navButtonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            iconPosition="top"
            icon={{name: 'person', size: 30, color: 'black'}}
            onPress={() => navigation.navigate('profile')}>
            <Text style={styles.buttonText}>Profile</Text>
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  componentContainer: {flex: 1},
  visible: {display: 'flex'},
  hidden: {display: 'none'},
  navContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  navButtonContainer: {
    flexDirection: 'column',
    borderRadius: 30,
  },
  buttonContainer: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 30,
    tintColor: 'black',
    width: '45%',
  },
  backButtonContainer: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 30,
    tintColor: 'black',
  },
  button: {
    borderColor: 'transparent',
    padding: 0,
    margin: 0,
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    height: 60,
  },
  buttonText: {
    textAlign: 'center',
    color: 'black',
  },

  // TODO: NEED MORE INVESTIGATION
  cameraPIP: {
    overflow: 'hidden',
    position: 'absolute',
    borderRadius: 60,
    top: -height * 0.5 + (height * 0.2) / 2 + 100,
    left: -width * 0.5 + (width * 0.2) / 2 + 20,
    width: width * 1,
    height: height * 1,
    transform: [{scale: 0.2}],
    zIndex: 1,
  },
});
