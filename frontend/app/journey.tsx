import React, {useCallback, useRef, useState, useEffect} from 'react';
import {View, StyleSheet, Text, Image, ImageSourcePropType, AppState} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {CameraView} from '@/features/safety-alert/components/CameraView';
import {Map} from '@/app/map';
import {StartConfirmationDialog} from '@/components/StartConfirmationDialog';
import {EndConfirmationDialog} from '@/components/EndConfirmationDialog';
import {useFaceDetectionContext} from '@/contexts/FaceDetectionProvider';
import type {ViewModeType} from '@/types/ViewModeType';
import GoogleMapImage from '@/assets/images/google-map.png';
import BackButton from '@/components/BackButton';
import SearchHereToDrive from '@/components/SearchHereToDrive';
import StartDrivingButton from '@/components/StartDrivingButton';
import TurnOnDetectionButton from '@/components/TurnOnDetectionButton';
import TurnOffDetectionButton from '@/components/TurnOffDetectionButton';
import EndRouteButton from '@/components/EndRouteButton';
import {INSTRUCTION_MESSAGE} from '@/features/safety-alert/constants/messages';
import {Audio} from 'expo-av';

const GoogleMapIcon = GoogleMapImage as ImageSourcePropType;

const eyeIcon = require('@/assets/images/icon_detecting.png');

export default function HomeScreen() {
  const {alertCount} = useFaceDetectionContext();
  const {setViewModeContext, alertStatus, setInstructionStatus, instructionStatus} =
    useFaceDetectionContext();
  const [viewMode, setViewMode] = useState<ViewModeType>('cameraView');
  const [driveDestinationStatus, setDriveDestinationStatus] = useState(false);
  const [driveModeStatus, setDriveModeStatus] = useState(false);
  const [startDriveStatus, setStartDriveStatus] = useState(false);
  const [endDriveStatus, setEndDriveStatus] = useState(false);
  const [isFaceDetectionActive, setIsFaceDetectionActive] = useState(true);
  const [startDialogStatus, setStartDialogStatus] = useState(false);
  const [endDialogStatus, setEndDialogStatus] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const instructionSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    console.log('[DEBUG] Journey component is mounted');
    const timeout = setTimeout(async () => {
      if (AppState.currentState === 'active') {
        try {
          triggerMessage(INSTRUCTION_MESSAGE[0].voice);
        } catch (e) {
          console.error('[ERROR] Audio error:', e);
        }
      } else {
        console.warn('[WARN] App is not active, skip sound');
      }
    }, 500);

    return () => {
      console.log('[DEBUG] Journey component is unmounted');
      clearTimeout(timeout);
      if (instructionSoundRef.current) {
        instructionSoundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    console.log('[DEBUG] Detection Pause:', instructionStatus);
  }, [instructionStatus]);

  const triggerMessage = async (message: any) => {
    setInstructionStatus(true);
    try {
      if (instructionSoundRef.current) {
        await instructionSoundRef.current.unloadAsync();
      }
      const {sound: instructionMessageInstance} = await Audio.Sound.createAsync(message);
      instructionSoundRef.current = instructionMessageInstance;
      await instructionMessageInstance.playAsync();
      await new Promise<void>(resolve => {
        instructionMessageInstance.setOnPlaybackStatusUpdate(status => {
          if (status.isLoaded && status.didJustFinish) {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error(error);
    } finally {
      setInstructionStatus(false);
    }
  };

  // Cocoy's Update: Swap map and camera view when destination is selected
  // useEffect(() => {
  //   if (driveDestinationStatus && viewMode === 'cameraView') {
  //     setViewMode('mapView');
  //     setViewModeContext('mapView');
  //   }
  // }, [driveDestinationStatus, viewMode, setViewModeContext]);

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
          setViewMode={setViewMode} // Cocoy's Update: Pass setViewMode
          setViewModeContext={setViewModeContext} // Cocoy's Update: Pass setViewModeContext
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
              ? [styles.miniWindowView, {borderColor: alertStatus ? '#FF4B4B' : 'lightgreen'}]
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
        )}

        {/* Destination Clear Button */}
        {!driveModeStatus && driveDestinationStatus && (
          <BackButton
            onPress={() => {
              mapRef.current?.clearSearch();
            }}
          />
        )}

        {/* Turn Off Face Detection Button  */}
        {driveModeStatus && isFaceDetectionActive && (
          <TurnOffDetectionButton onPress={() => setIsFaceDetectionActive(false)} />
        )}

        {/* Turn On Detection Button　*/}
        {driveModeStatus && !isFaceDetectionActive && (
          <TurnOnDetectionButton onPress={() => setIsFaceDetectionActive(true)} />
        )}

        {/* Search Here to Drive Button */}
        {!driveModeStatus && !driveDestinationStatus && isFaceDetectionActive && (
          <SearchHereToDrive
            onPress={() => mapRef.current?.openSearch('destination')}
            iconSource={GoogleMapIcon}
          />
        )}

        {/* Start Driving Button */}
        {!driveModeStatus && driveDestinationStatus && isFaceDetectionActive && (
          <StartDrivingButton onPress={() => setStartDriveStatus(true)} />
        )}

        {/* End Route Button */}
        {driveModeStatus && <EndRouteButton onPress={() => toggleEndDialog()} disabled={false} />}

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
        {viewMode === 'cameraView' && isFaceDetectionActive && (
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
  invisible: {
    opacity: 0,
    position: 'absolute',
    width: 0,
    height: 0,
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
    bottom: 96,
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
