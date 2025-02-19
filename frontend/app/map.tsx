import React, {useState, useEffect, useRef} from 'react';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import {StyleSheet, View, Alert, TextInput} from 'react-native';
import {Button} from '@rneui/themed';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';

// Define the Region type
type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const GOOGLE_MAPS_APIKEY = 'AIzaSyDIAo1tsrhW48a34z8OsWOdMrjsQS9LAt0'; // Replace with your actual API key

export const Map = () => {
  const [location, setLocation] = useState<Region | null>(null);
  const [origin, setOrigin] = useState<{latitude: number; longitude: number}>({
    latitude: 49.2257,
    longitude: -123.105,
  });
  const [destination, setDestination] = useState<{latitude: number; longitude: number}>({
    latitude: 49.282,
    longitude: -123.1203,
  });
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
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

  const handleGoButtonPress = () => {
    const originCoords = originInput.split(',').map(coord => parseFloat(coord.trim()));
    const destinationCoords = destinationInput.split(',').map(coord => parseFloat(coord.trim()));

    if (originCoords.length === 2 && destinationCoords.length === 2) {
      setOrigin({latitude: originCoords[0], longitude: originCoords[1]});
      setDestination({latitude: destinationCoords[0], longitude: destinationCoords[1]});
    } else {
      Alert.alert(
        'Invalid Input',
        'Please enter valid coordinates in the format: latitude, longitude',
      );
    }
  };

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
        showsMyLocationButton>
        {/* Plot Directions */}
        <MapViewDirections
          origin={origin}
          destination={destination}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={4}
          strokeColor="blue"
        />
      </MapView>

      <View style={mapStyles.inputContainer}>
        <TextInput
          style={mapStyles.input}
          placeholder="Enter origin (latitude, longitude)"
          value={originInput}
          onChangeText={setOriginInput}
        />
        <TextInput
          style={mapStyles.input}
          placeholder="Enter destination (latitude, longitude)"
          value={destinationInput}
          onChangeText={setDestinationInput}
        />
        <Button title="Go" onPress={handleGoButtonPress} />
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
  inputContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
});
