import React, {useCallback, useRef, useState} from 'react';
import {View, StyleSheet, Text, Image, ImageSourcePropType} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {CameraView} from '@/features/safety-alert/components/CameraView';
import {Map} from '@/app/map';
import {Button, Icon} from '@rneui/themed';
import {StartConfirmationDialog} from '@/features/safety-alert/components/StartConfirmationDialog';
import {EndConfirmationDialog} from '@/features/safety-alert/components/EndConfirmationDialog';
import {useFaceDetectionContext} from '@/contexts/FaceDetectionProvider';
import type {ViewModeType} from '@/types/ViewModeType';
import GoogleMapImage from '@/assets/images/google-map.png';
import BackButton from '@/components/BackButton';
import SearchHereToDrive from '@/components/SearchHereToDrive';
import StartDrivingButton from '@/components/StartDrivingButton';
import TurnOnDetectionButton from '@/components/TurnOnDetectionButton';
import TurnOffDetectionButton from '@/components/TurnOffDetectionButton';
import EndRouteButton from '@/components/EndRouteButton';

const GoogleMapIcon = GoogleMapImage as ImageSourcePropType;

const eyeIcon = require('@/assets/images/eye-closed.png');

export default function HomeScreen() {
  const {alertCount} = useFaceDetectionContext();
  const {setViewModeContext} = useFaceDetectionContext();
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
        onResponderRelease={() => {
          setViewMode('mapView');
          setViewModeContext('mapView');
        }}
        style={[
          styles.mapComponentContainer,
          viewMode === 'mapView'
            ? styles.visible
            : [styles.miniWindowView, {borderColor: 'none', borderWidth: 0}],
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
        onResponderRelease={() => {
          setViewMode('cameraView');
          setViewModeContext('cameraView');
        }}
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
      </View>

      <View style={styles.navContainer}>
        {/* Back Home Button */}
        {!driveModeStatus && !driveDestinationStatus && isFaceDetectionActive && (
          <BackButton onPress={toggleEndDialog} />

          // <Button
          //   type="clear"
          //   containerStyle={styles.backButtonContainer}
          //   buttonStyle={styles.button}
          //   titleStyle={styles.buttonText}
          //   iconPosition="top"
          //   icon={{name: 'west', size: 16, color: 'black'}}
          //   onPress={() => toggleEndDialog()}>
          //   {/* <Text style={styles.buttonText}>Back</Text> */}
          // </Button>
        )}

        {/* Destination Clear Button */}
        {!driveModeStatus && driveDestinationStatus && (
          <BackButton onPress={toggleEndDialog} />
          // <Button
          //   type="clear"
          //   containerStyle={styles.backButtonContainer}
          //   buttonStyle={styles.button}
          //   titleStyle={styles.buttonText}
          //   iconPosition="top"
          //   icon={{name: 'west', size: 16, color: 'black'}}
          //   onPress={() => {
          //     mapRef.current?.clearSearch();
          //   }}>
          // {/* <Text style={styles.buttonText}>Back</Text> */}
          // </Button>
        )}

        {/* Turn Off Face Detection Button  */}
        {driveModeStatus && isFaceDetectionActive && (
          <TurnOffDetectionButton onPress={() => setIsFaceDetectionActive(false)} />
          // <Button
          //   type="clear"
          //   containerStyle={styles.buttonContainer}
          //   buttonStyle={styles.button}
          //   titleStyle={styles.buttonText}
          //   onPress={() => setIsFaceDetectionActive(false)}>
          //   <Icon name="videocam-off" size={28} color="black" />
          //   <Text style={styles.buttonText}>Turn off{'\n'}detection</Text>
          // </Button>
        )}

        {/* Turn On Detection Button　*/}
        {driveModeStatus && !isFaceDetectionActive && (
          <TurnOnDetectionButton onPress={() => setIsFaceDetectionActive(true)} />
          // <Button
          //   type="clear"
          //   containerStyle={styles.buttonContainer}
          //   buttonStyle={styles.button}
          //   titleStyle={styles.buttonText}
          //   onPress={() => setIsFaceDetectionActive(true)}>
          //   <Icon name="videocam" size={28} color="black" />
          //   <Text style={styles.buttonText}>Start{'\n'}detection</Text>
          // </Button>
        )}

        {/* Search Here to Drive Button */}
        {!driveModeStatus && !driveDestinationStatus && isFaceDetectionActive && (
          <SearchHereToDrive
            onPress={() => mapRef.current?.openSearch('destination')}
            iconSource={GoogleMapIcon}
          />
          // <Button
          //   type="clear"
          //   containerStyle={styles.buttonContainer}
          //   buttonStyle={styles.button}
          //   titleStyle={styles.buttonText}
          //   onPress={() => mapRef.current?.openSearch('destination')}>
          //   <Image source={GoogleMapIcon} style={{height: 36, width: 36}} />
          //   <Text style={styles.buttonText}>Search here to drive</Text>
          // </Button>
        )}

        {/* Start Driving Button */}
        {!driveModeStatus && driveDestinationStatus && isFaceDetectionActive && (
          <StartDrivingButton onPress={() => setStartDriveStatus(true)} />
          // <Button
          //   type="clear"
          //   containerStyle={styles.buttonContainer}
          //   buttonStyle={styles.button}
          //   titleStyle={styles.buttonText}
          //   onPress={() => setStartDriveStatus(true)}>
          //   <Text style={styles.buttonText}>Start Driving</Text>
          // </Button>
        )}

        {/* End Route Button */}
        {driveModeStatus && (
          <EndRouteButton onPress={() => toggleEndDialog()} disabled={false} />
          // <Button
          //   type="clear"
          //   containerStyle={styles.buttonContainer}
          //   buttonStyle={styles.button}
          //   titleStyle={styles.buttonText}
          //   onPress={() => toggleEndDialog()}>
          //   <Text style={styles.buttonText}>End Route</Text>
          // </Button>
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

        {/* Alert Counter */}
        {viewMode === 'cameraView' && (
          <View style={styles.alertContainer}>
            <Image source={eyeIcon} />
            <Text style={styles.alertText}>
              Drowsiness detected: <Text style={styles.alertCountText}>{alertCount} times</Text>
            </Text>
          </View>
        )}
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
    height: 96,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
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
  alertContainer: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 10,
    bottom: 80,
    left: 0,
    right: 0,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  alertText: {
    color: 'white',
  },
  alertCountText: {
    fontSize: 20,
  },
  // TODO: NEED MORE INVESTIGATION
  miniWindowView: {
    overflow: 'hidden',
    position: 'absolute',
    borderRadius: 60,
    borderWidth: 10,
    borderColor: 'lightgreen',
    top: -600 * 0.5 + (600 * 0.25) / 2 + 10,
    left: -400 * 0.5 + (400 * 0.25) / 2 + 10,
    height: 600,
    width: 400,
    transform: [{scale: 0.25}],
    zIndex: 1,
    boxShadow: '5px 5px 10px 5px rgba(0, 0, 0, 0.2)',
  },
});
