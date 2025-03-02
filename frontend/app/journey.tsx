import React, {useCallback, useRef, useState} from 'react';
import {View, StyleSheet, Text, Dimensions, Image, ImageSourcePropType} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {CameraView} from '@/features/safety-alert/components/CameraView';
import {Map} from '@/app/map';
import {Button} from '@rneui/themed';
import {FaceDetectionWindowFrame} from '@/features/safety-alert/components/FaceDetectionWindowFrame';
import {StartConfirmationDialog} from '@/features/safety-alert/components/StartConfirmationDialog';
import {EndConfirmationDialog} from '@/features/safety-alert/components/EndConfirmationDialog';
import type {ViewModeType} from '@/types/ViewModeType';
import GoogleMapImage from '@/assets/images/google-map.png';
const GoogleMapIcon = GoogleMapImage as ImageSourcePropType;

const {width, height} = Dimensions.get('window');

export default function HomeScreen() {
  const [viewMode, setViewMode] = useState<ViewModeType>('mapView');
  const [isFaceDetectionActive, setIsFaceDetectionActive] = useState(true);
  const [startDialogStatus, setStartDialogStatus] = useState(false);
  const [endDialogStatus, setEndDialogStatus] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      console.log(`[DEBUG] Journey Screen is focused`);
      setIsFaceDetectionActive(true);

      // To Cocoy: Reset map key to re-render the map component
      // Please delete this line if it's not necessary
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
  const mapRef = useRef<{openSearch: (field: 'origin' | 'destination') => void} | null>(null);

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
        {/* Cocoy's Update: Pass ref to Map component */}
        <Map key={mapKey} ref={mapRef} />
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
            containerStyle={styles.searchButtonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            onPress={() => mapRef.current?.openSearch('destination')} // Cocoy's Update: Call openSearch from mapRef
          >
            <Image source={GoogleMapIcon} />
            <Text style={styles.buttonText}>Search here to drive</Text>
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
        />

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

        {/* Start Face Detection Button　-> This will be used in navigation mode. TBD */}
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
  searchButtonContainer: {
    flex: 1,
  },
  buttonContainer: {},
  backButtonContainer: {},
  button: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  buttonText: {
    textAlign: 'center',
  },

  // TODO: NEED MORE INVESTIGATION
  miniWindowView: {
    overflow: 'hidden',
    position: 'absolute',
    borderRadius: 60,
    top: -height * 0.5 + (height * 0.2) / 2 + 10,
    left: -width * 0.5 + (width * 0.2) / 2 + 10,
    width: width * 1,
    height: height * 1,
    transform: [{scale: 0.2}],
    zIndex: 1,
  },
});
