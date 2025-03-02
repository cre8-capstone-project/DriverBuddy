import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Text, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {CameraView} from '@/features/safety-alert/components/CameraView';
import {Map} from '@/app/map';
import {Button, Icon} from '@rneui/themed';
import {FaceDetectionWindowFrame} from '@/features/safety-alert/components/FaceDetectionWindowFrame';
import {ConfirmationDialog} from '@/features/safety-alert/components/ConfirmationDialog';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {ViewMode} from '@/types/ViewMode';

import {useTheme} from '@rneui/themed';
import {TouchableOpacity} from 'react-native';
import {size} from '@shopify/react-native-skia';

type RootStackParamList = {
  settings: undefined;
  profile: undefined;
};

const {width, height} = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [viewMode, setViewMode] = useState<ViewMode>('cameraView');
  const [isFaceDetectionActive, setIsFaceDetectionActive] = useState(false);
  const [dialogStatus, setDialogStatus] = useState(false);
  const [viewKey, setViewKey] = useState(0);

  const {theme} = useTheme();

  const toggleDialog = () => {
    setDialogStatus(!dialogStatus);
  };

  useEffect(() => {
    setViewKey(prevKey => prevKey + 1);
  }, [viewMode]);

  return (
    <View style={styles.container}>
      {/* Switch View Mode: Camera or Map */}
      <View
        style={[
          styles.componentContainer,
          viewMode === 'mapView' ? styles.visible : styles.hidden,
        ]}>
        <Map key={`map-${viewKey}`} />
      </View>
      <View
        style={[
          styles.componentContainer,
          // viewMode === 'cameraView' ? styles.visible : styles.hidden,
          viewMode === 'cameraView'
            ? styles.visible
            : isFaceDetectionActive
              ? styles.faceDetectionFrame
              : styles.hidden,
        ]}>
        <CameraView
          key={`camera-${viewKey}`}
          isFaceDetectionActive={isFaceDetectionActive}
          setIsFaceDetectionActive={setIsFaceDetectionActive}
        />
        <FaceDetectionWindowFrame
          viewMode={viewMode}
          isFaceDetectionActive={isFaceDetectionActive}
        />
      </View>

      <View style={styles.navContainer}>
        {/* Back Button */}
        {viewMode === 'mapView' && (
          <TouchableOpacity
            onPress={() => setViewMode('cameraView')}
            activeOpacity={0.7}
            style={[
              theme.components.Button.containerStyle,
              {
                width: 88,
                height: 88,
                borderRadius: 44,
                borderWidth: 2,
                borderColor: theme.colors.white,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.white,
                shadowColor: theme.colors.black,
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.25,
                shadowRadius: 3,
                elevation: 3,
              },
            ]}>
            <Icon name="west" type="material" color={'black'} />
            <Text style={[theme.components.Text.style, {fontSize: 15, color: 'black'}]}>Back</Text>
          </TouchableOpacity>
        )}

        {/* Setting Button */}
        {viewMode === 'cameraView' && !isFaceDetectionActive && (
          <TouchableOpacity
            onPress={() => navigation.navigate('settings')}
            style={{
              alignItems: 'center',
              paddingVertical: 10,
            }}>
            <Icon name="settings" type="material" style={theme.components.Icon} />
            <Text style={[theme.components.Text.style, {marginTop: 4}]}>Settings</Text>
          </TouchableOpacity>
        )}

        {/* Turn Off Face Detection Button */}
        {isFaceDetectionActive && (
          <Button
            type="clear"
            containerStyle={styles.buttonContainer}
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            onPress={() => setIsFaceDetectionActive(false)}>
            <Icon name="videocam-off" size={40} color="black" />
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
            onPress={toggleDialog}>
            <Icon name="videocam" size={40} color="black" />
            <Text style={styles.buttonText}>Start{'\n'}your journey</Text>
          </Button>
        )}

        {/* Start Face Detection Confirmation Dialog */}
        <ConfirmationDialog
          dialogStatus={dialogStatus}
          toggleDialog={toggleDialog}
          setIsFaceDetectionActive={setIsFaceDetectionActive}
        />

        {/* Map View Button */}
        {viewMode === 'cameraView' && (
          <Button
            type="outline"
            style={[theme.components.Button.buttonStyle, theme.components.Button.containerStyle]}
            onPress={() => setViewMode('mapView')}>
            <Icon name="location-on" type="material" style={theme.components.Icon} />
            <Text style={theme.components.Text.style}>Map View</Text>
          </Button>
        )}

        {/* Profile Button */}
        {viewMode === 'cameraView' && !isFaceDetectionActive && (
          <TouchableOpacity
            onPress={() => navigation.navigate('profile')}
            style={{
              alignItems: 'center',
              paddingVertical: 10,
            }}>
            <Icon
              name="person"
              type="material"
              style={theme.components.Icon}
              // color={theme.components?.Icon?.color || theme.colors.primary}
            />
            <Text style={[theme.components.Text.style, {marginTop: 4}]}>Profile</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  componentContainer: {flex: 1},
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
    borderWidth: 2,
    borderRadius: 30,
    borderColor: '#1E3A8A',
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
  },

  // TODO: NEED MORE INVESTIGATION
  faceDetectionFrame: {
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
