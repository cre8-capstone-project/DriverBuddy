import React, {useState} from 'react';
import {View, StyleSheet, Text, Dimensions, Image, ImageSourcePropType} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {CameraView} from '@/features/safety-alert/components/CameraView';
import {Map} from '@/app/map';
import {Button} from '@rneui/themed';
import {FaceDetectionWindowFrame} from '@/features/safety-alert/components/FaceDetectionWindowFrame';
import {StartConfirmationDialog} from '@/features/safety-alert/components/StartConfirmationDialog';
import {EndConfirmationDialog} from '@/features/safety-alert/components/EndConfirmationDialog';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {ViewMode} from '@/types/ViewMode';

import GoogleMapImage from '@/assets/images/google-map.png';
const GoogleMapIcon = GoogleMapImage as ImageSourcePropType;

type RootStackParamList = {
  settings: undefined;
  profile: undefined;
};

const {width, height} = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [viewMode, setViewMode] = useState<ViewMode>('cameraView');
  const [isFaceDetectionActive, setIsFaceDetectionActive] = useState(false);
  const [startDialogStatus, setStartDialogStatus] = useState(false);
  const [endDialogStatus, setEndDialogStatus] = useState(false);

  const toggleStartDialog = () => {
    setStartDialogStatus(!startDialogStatus);
  };
  const toggleEndDialog = () => {
    setEndDialogStatus(!endDialogStatus);
  };

  return (
    <View style={styles.container}>
      {/* Switch View Mode: Camera or Map */}
      <View
        onStartShouldSetResponder={() => true}
        onResponderRelease={() => setViewMode('mapView')}
        style={[
          styles.mapComponentContainer,
          viewMode === 'mapView'
            ? styles.visible
            : isFaceDetectionActive
              ? styles.miniWindowView
              : styles.invisible,
        ]}>
        <Map />
      </View>
      <View
        onStartShouldSetResponder={() => true}
        onResponderRelease={() => setViewMode('cameraView')}
        style={[
          styles.cameraComponentContainer,
          viewMode === 'cameraView'
            ? styles.visible
            : isFaceDetectionActive
              ? styles.miniWindowView
              : styles.invisible,
        ]}>
        <CameraView
          isFaceDetectionActive={isFaceDetectionActive}
          setIsFaceDetectionActive={setIsFaceDetectionActive}
          setViewMode={setViewMode}
          viewMode={viewMode}
        />
        <FaceDetectionWindowFrame
          viewMode={viewMode}
          isFaceDetectionActive={isFaceDetectionActive}
        />
      </View>

      <View style={styles.navContainer}>
        {/* Back Home Button */}
        {isFaceDetectionActive && (
          <Button
            type="clear"
            containerStyle={styles.backButtonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            iconPosition="top"
            icon={{name: 'west', size: 20, color: 'black'}}
            onPress={() => toggleEndDialog()}>
            <Text style={styles.buttonText}>Back</Text>
          </Button>
        )}

        {/* Search Here to Drive  Button */}
        {isFaceDetectionActive && (
          <Button
            type="clear"
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            // onPress={}
          >
            <Image source={GoogleMapIcon} />
            <Text style={styles.buttonText}>Search here to drive</Text>
          </Button>
        )}

        {/* Start Face Detection Confirmation Dialog */}
        <StartConfirmationDialog
          dialogStatus={startDialogStatus}
          toggleDialog={toggleStartDialog}
          setIsFaceDetectionActive={setIsFaceDetectionActive}
          setViewMode={setViewMode}
        />

        {/* Turn off Face Detection Confirmation Dialog */}
        <EndConfirmationDialog
          dialogStatus={endDialogStatus}
          toggleDialog={toggleEndDialog}
          setIsFaceDetectionActive={setIsFaceDetectionActive}
          setViewMode={setViewMode}
        />

        {/* Home Button */}
        {viewMode === 'cameraView' && !isFaceDetectionActive && (
          <Button
            type="clear"
            containerStyle={styles.navButtonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            iconPosition="top"
            icon={{name: 'home', size: 30, color: 'black'}}>
            <Text style={styles.buttonText}>Home</Text>
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

        {/* Turn Off Face Detection Button -> This will be used in navigation mode. TBD */}
        {/* {isFaceDetectionActive && (
          <Button
            type="clear"
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            onPress={() => setIsFaceDetectionActive(false)}>
            <Icon name="videocam-off" size={30} color="black" />
            <Text style={styles.buttonText}>Turn off{'\n'}detection</Text>
          </Button>
        )} */}

        {/* Start Face Detection Button */}
        {/* {viewMode === 'mapView' && !isFaceDetectionActive && (
          <Button
            type="clear"
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            onPress={toggleDialog}>
            <Icon name="videocam" size={30} color="black" />
            <Text style={styles.buttonText}>Start{'\n'}detection</Text>
          </Button>
        )} */}

        {/* Map View Button */}
        {/* {viewMode === 'cameraView' && (
          <Button
            type="outline"
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            onPress={() => setViewMode('mapView')}>
            <Icon name="location-on" size={30} color="black" />
            <Text style={styles.buttonText}>Map View</Text>
          </Button>
        )} */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  mapComponentContainer: {flex: 1},
  cameraComponentContainer: {flex: 1},
  // visible: {display: 'flex'},
  // hidden: {display: 'none'},
  visible: {
    opacity: 1,
    position: 'relative',
    flex: 1,
  },
  hidden: {
    opacity: 0,
    position: 'absolute',
    width: 0,
    height: 0,
  },
  invisible: {
    opacity: 0,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  navContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 20,
  },
  navButtonContainer: {
    flexDirection: 'column',
    borderRadius: 30,
    marginVertical: 5,
  },
  buttonContainer: {
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 30,
    tintColor: 'black',
    flex: 1,
    marginVertical: 10,
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
  },
  buttonText: {
    textAlign: 'center',
    color: 'black',
  },

  // TODO: NEED MORE INVESTIGATION
  miniWindowView: {
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
