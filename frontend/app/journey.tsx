import React, {useCallback, useRef, useState, useEffect} from 'react';
import {View, StyleSheet, Text, Image, ImageSourcePropType, AppState, Animated} from 'react-native';
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
import {usePlaySound} from '@/hooks/usePlaySound';
import AddRestStopPanel from '@/features/map/components/AddRestStopPanel';

const GoogleMapIcon = GoogleMapImage as ImageSourcePropType;

const eyeIcon = require('@/assets/images/icon_detecting.png');

export default function HomeScreen() {
  const {alertCount} = useFaceDetectionContext();
  const {
    setViewModeContext,
    alertStatus,
    setInstructionStatus,
    instructionStatus,
    operationStatus,
  } = useFaceDetectionContext();
  const {playSound} = usePlaySound();
  const [viewMode, setViewMode] = useState<ViewModeType>('cameraView');
  const [driveDestinationStatus, setDriveDestinationStatus] = useState(false);
  const [driveModeStatus, setDriveModeStatus] = useState(false);
  const [startDriveStatus, setStartDriveStatus] = useState(false);
  const [endDriveStatus, setEndDriveStatus] = useState(false);
  const [isFaceDetectionActive, setIsFaceDetectionActive] = useState(true);
  const [startDialogStatus, setStartDialogStatus] = useState(false);
  const [endDialogStatus, setEndDialogStatus] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  // Cocoy's Update: State for managing add rest stop panel and details
  const [showRestStopPanel, setShowRestStopPanel] = useState(false);
  const [selectedRestStop, setSelectedRestStop] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);

  // Cocoy's Update: Animation for navContainer
  const navSlideAnim = useRef(new Animated.Value(0)).current;

  // Cocoy's Update: Function to hide/slide navContainer
  const slideNav = (hide: boolean) => {
    Animated.timing(navSlideAnim, {
      toValue: hide ? 100 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

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
    };
  }, []);

  useEffect(() => {
    console.log('[DEBUG] Detection Pause (Instruction):', instructionStatus);
  }, [instructionStatus]);

  useEffect(() => {
    console.log('[DEBUG] Detection Pause (Operation):', operationStatus);
  }, [operationStatus]);

  const triggerMessage = async (message: any) => {
    try {
      setInstructionStatus(true);
      await playSound(message);
    } catch (error) {
      console.error(error);
    } finally {
      setInstructionStatus(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log(`[DEBUG] Journey Screen is focused`);
      setIsFaceDetectionActive(true);
      setMapKey(prev => prev + 1);
      mapRef.current?.clearSearch(); // Cocoy's Update: Clear search when starting a new journey
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
    addWaypoint: (station: {latitude: number; longitude: number; name: string} | null) => void;
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
          viewMode={viewMode} // Cocoy's Update: Pass viewMode
          // Cocoy's Update: Select rest stop and open add rest stop panel
          onShowRestStopPanel={station => {
            setSelectedRestStop(station);
            setShowRestStopPanel(true);
          }}
          onToggleNav={slideNav} // ADDED OR UPDATED 01 APR: Pass navContainer hide/unhide function
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

      {/* Cocoy's Update: Wrap navContainer in animated view to hide/unhide */}
      <Animated.View style={[styles.navContainer, {transform: [{translateY: navSlideAnim}]}]}>
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
      </Animated.View>

      {showRestStopPanel && (
        <View style={styles.addRestStopPanelOverlay} pointerEvents="auto">
          {/* Cocoy's Update: Add invisible layer to block touches on map behind the panel */}
          <View style={styles.invisibleBlocker} pointerEvents="auto" />
          <AddRestStopPanel
            visible={showRestStopPanel}
            station={selectedRestStop}
            onConfirmYes={() => {
              // Cocoy's Update: Call addWaypoint in map.tsx to update the route
              mapRef.current?.addWaypoint(selectedRestStop);
              setShowRestStopPanel(false);
              setSelectedRestStop(null);
            }}
            onConfirmNo={() => {
              setShowRestStopPanel(false);
              setSelectedRestStop(null);
            }}
          />
        </View>
      )}
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
  // Cocoy's Update: AddRestStopPanel styles
  addRestStopPanelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  addRestStopPanelOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  invisibleBlocker: {
    height: 250,
    backgroundColor: 'transparent',
  },
});
