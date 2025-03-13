import React, {useCallback, useRef, useState} from 'react';
import {View, StyleSheet, Text, Dimensions, Image, ImageSourcePropType} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {CameraView} from '@/features/safety-alert/components/CameraView';
import {Map} from '@/app/map';
import {Button, Icon} from '@rneui/themed';
import {FaceDetectionWindowFrame} from '@/features/safety-alert/components/FaceDetectionWindowFrame';
import {StartConfirmationDialog} from '@/features/safety-alert/components/StartConfirmationDialog';
import {EndConfirmationDialog} from '@/features/safety-alert/components/EndConfirmationDialog';
import type {ViewModeType} from '@/types/ViewModeType';
import GoogleMapImage from '@/assets/images/google-map.png';
const GoogleMapIcon = GoogleMapImage as ImageSourcePropType;

const {width, height} = Dimensions.get('window');

export default function HomeScreen() {
  const [viewMode, setViewMode] = useState<ViewModeType>('mapView');
  const [driveDestinationStatus, setDriveDestinationStatus] = useState(false);
  const [driveModeStatus, setDriveModeStatus] = useState(false);
  const [startDriveStatus, setStartDriveStatus] = useState(false);
  const [endDriveStatus, setEndDriveStatus] = useState(false);
  const [isFaceDetectionActive, setIsFaceDetectionActive] = useState(true);
  const [startDialogStatus, setStartDialogStatus] = useState(false);
  const [endDialogStatus, setEndDialogStatus] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      console.log(`[DEBUG] Journey Screen is focused`);
      setIsFaceDetectionActive(true);
      setMapKey(prev => prev + 1);
    }, []),
  );

  const toggleStartDialog = () => {
    setStartDialogStatus(!startDialogStatus);
  };
  const toggleEndDialog = () => {
    setEndDialogStatus(!endDialogStatus);
  };

  // Cocoy's Update: Create a ref for Map component
  const mapRef = useRef<{
    openSearch: (field: 'origin' | 'destination') => void;
    clearSearch: () => void;
  } | null>(null);

  return (
    <View style={styles.container}>
      {/* Switch View Mode: Camera or Map */}
      <View
        onStartShouldSetResponder={() => true}
        onResponderRelease={() => setViewMode('mapView')}
        style={[
          styles.mapComponentContainer,
          viewMode === 'mapView' ? styles.visible : styles.miniWindowView,
        ]}>
        <Map
          key={mapKey}
          ref={mapRef}
          setDriveDestinationStatus={setDriveDestinationStatus}
          setDriveModeStatus={setDriveModeStatus}
          startDriveStatus={startDriveStatus}
          endDriveStatus={endDriveStatus}
        />
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
        {!driveModeStatus && !driveDestinationStatus && isFaceDetectionActive && (
          <Button
            type="clear"
            containerStyle={styles.backButtonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            iconPosition="top"
            icon={{name: 'west', size: 16, color: 'black'}}
            onPress={() => toggleEndDialog()}>
            {/* <Text style={styles.buttonText}>Back</Text> */}
          </Button>
        )}

        {/* Destination Clear Button */}
        {!driveModeStatus && driveDestinationStatus && (
          <Button
            type="clear"
            containerStyle={styles.backButtonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            iconPosition="top"
            icon={{name: 'west', size: 16, color: 'black'}}
            onPress={() => {
              mapRef.current?.clearSearch();
            }}>
            {/* <Text style={styles.buttonText}>Back</Text> */}
          </Button>
        )}

        {/* Turn Off Face Detection Button  */}
        {driveModeStatus && isFaceDetectionActive && (
          <Button
            type="clear"
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            onPress={() => setIsFaceDetectionActive(false)}>
            <Icon name="videocam-off" size={28} color="black" />
            <Text style={styles.buttonText}>Turn off{'\n'}detection</Text>
          </Button>
        )}

        {/* Start Face Detection Button　*/}
        {driveModeStatus && !isFaceDetectionActive && (
          <Button
            type="clear"
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            onPress={() => setIsFaceDetectionActive(true)}>
            <Icon name="videocam" size={28} color="black" />
            <Text style={styles.buttonText}>Start{'\n'}detection</Text>
          </Button>
        )}

        {/* Search Here to Drive Button */}
        {!driveModeStatus && !driveDestinationStatus && isFaceDetectionActive && (
          <Button
            type="clear"
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            onPress={() => mapRef.current?.openSearch('destination')}>
            <Image source={GoogleMapIcon} style={{height: 36, width: 36}} />
            <Text style={styles.buttonText}>Search here to drive</Text>
          </Button>
        )}

        {/* Start Driving Button */}
        {!driveModeStatus && driveDestinationStatus && isFaceDetectionActive && (
          <Button
            type="clear"
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            onPress={() => setStartDriveStatus(true)}>
            <Text style={styles.buttonText}>Start Driving</Text>
          </Button>
        )}

        {/* End Route Button */}
        {driveModeStatus && (
          <Button
            type="clear"
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            onPress={() => toggleEndDialog()}>
            <Text style={styles.buttonText}>End Route</Text>
          </Button>
        )}

        {/* Start Face Detection Confirmation Dialog */}
        <StartConfirmationDialog
          dialogStatus={startDialogStatus}
          toggleDialog={toggleStartDialog}
        />

        {/* Turn off Face Detection Confirmation Dialog */}
        <EndConfirmationDialog
          dialogStatus={endDialogStatus}
          toggleDialog={toggleEndDialog}
          setIsFaceDetectionActive={setIsFaceDetectionActive}
          driveMode={driveModeStatus}
          setEndDrive={setEndDriveStatus}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  mapComponentContainer: {flex: 1},
  cameraComponentContainer: {flex: 1},
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
    height: 80,
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 20,
  },
  buttonContainer: {flex: 1},
  backButtonContainer: {},
  button: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 10,
  },
  buttonText: {
    textAlign: 'center',
  },

  // TODO: NEED MORE INVESTIGATION
  miniWindowView: {
    overflow: 'hidden',
    position: 'absolute',
    borderRadius: 60,
    top: -height * 0.5 + (height * 0.25) / 2 + 10,
    left: -width * 0.5 + (width * 0.25) / 2 + 10,
    width: width * 1,
    height: height * 1,
    transform: [{scale: 0.25}],
    zIndex: 1,
  },
});
