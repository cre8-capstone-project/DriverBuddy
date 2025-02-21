import React, {useState} from 'react';
import {View, TouchableOpacity, StyleSheet, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {MaterialIcons} from '@expo/vector-icons';
import type {StackNavigationProp} from '@react-navigation/stack';
import {CameraView} from '@/features/safety-alert/components/CameraView';
import {Map} from '@/app/map';
import {Button} from '@rneui/themed';

type RootStackParamList = {
  settings: undefined;
  profile: undefined;
};

type DisplayMode = 'camera' | 'map';

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [displayMode, setDisplayMode] = useState<DisplayMode>('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);

  return (
    <View style={styles.container}>
      {displayMode === 'camera' ? (
        <CameraView isCameraActive={isCameraActive} setIsCameraActive={setIsCameraActive} />
      ) : (
        <Map />
      )}
      <Button
        title={displayMode === 'camera' ? 'Turn on Map' : ''}
        type="outline"
        icon={
          displayMode === 'camera' ? (
            <MaterialIcons name="location-on" size={30} color="black" />
          ) : (
            <View style={styles.backButtonContainer}>
              <MaterialIcons name="west" size={30} color="black" />
              <Text style={styles.backText}>Back</Text>
            </View>
          )
        }
        titleStyle={styles.buttonText}
        containerStyle={[styles.turnOnMapButton, displayMode === 'map' && styles.backButtonStyle]}
        onPress={
          displayMode === 'camera' ? () => setDisplayMode('map') : () => setDisplayMode('camera')
        }
      />

      {displayMode === 'camera' && (
        <>
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => navigation.navigate('settings')}>
            <MaterialIcons name="settings" size={30} color="black" />
            <Text>Setting</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('profile')}>
            <MaterialIcons name="person" size={30} color="black" />
            <Text>Profile</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  turnOnMapButton: {
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderWidth: 2,
    borderRadius: 40,
    tintColor: 'black',
  },
  backButtonStyle: {
    justifyContent: 'center',
    // alignItems: 'center',
    width: 70,
    height: 70,
    left: 35,
    borderRadius: 90,
  },
  backButtonContainer: {
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
    color: 'black',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  settingButton: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    alignItems: 'center',
  },
  profileButton: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    alignItems: 'center',
  },
});
