import React, {useState, useEffect, useRef} from 'react';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import {StyleSheet, View, Alert} from 'react-native';
import {Button} from '@rneui/themed';

import * as Location from 'expo-location';

// Define the Region type
type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export default function App() {
  const [location, setLocation] = useState<Region | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      let {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please allow location access to show your position on the map.',
        );
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setLocation(newRegion);

      // Zoom to user's location
      mapRef.current?.animateToRegion(newRegion, 1000); // 1000ms = 1s animation
    })();
  }, []);

  return (
    <View style={mapStyles.container}>
      <MapView
        ref={mapRef}
        style={mapStyles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={
          location || {
            latitude: 49.2827, // Default to Vancouver
            longitude: -123.1207,
            latitudeDelta: 2, // Smaller = zoomed in
            longitudeDelta: 2,
          }
        }
        showsUserLocation
        showsMyLocationButton
      />
      <View style={mapStyles.buttonContainer}>
        <Button
          title="Button Test"
          onPress={() => {
            console.log('Button pressed');
            // Add functionality for the button here
          }}
        />
      </View>
    </View>
  );
}

// Styles for map page
const mapStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
});
