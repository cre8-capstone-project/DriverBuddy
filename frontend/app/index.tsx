import React, {useState} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
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
        title={displayMode === 'camera' ? 'Turn on Map' : 'Back'}
        type="outline"
        icon={{
          name: 'map',
          type: 'font-awesome',
          size: 15,
          color: 'black',
        }}
        titleStyle={styles.buttonText}
        containerStyle={styles.turnOnMapButton}
        onPress={
          displayMode === 'camera' ? () => setDisplayMode('map') : () => setDisplayMode('camera')
        }
      />
      <TouchableOpacity
        style={styles.settingButton}
        onPress={() => navigation.navigate('settings')}>
        <MaterialIcons name="settings" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('profile')}>
        <MaterialIcons name="person" size={24} color="black" />
      </TouchableOpacity>
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
    borderWidth: 2,
    tintColor: 'black',
  },
  settingButton: {
    position: 'absolute',
    bottom: 30,
    left: 30,
  },
  profileButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
});
