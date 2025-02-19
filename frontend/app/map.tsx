import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, View, Alert, Modal, Keyboard} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import {Button, Input, ListItem, Icon} from '@rneui/themed';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';

const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_APIKEY ?? '';
console.log('GOOGLE_MAPS_APIKEY:', GOOGLE_MAPS_APIKEY);

// Define the region type to represent a location on the map, including the latitude, longitude, and zoom levels
type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

// Save values temporarily so they can be used later even if the app is closed or reloaded
let savedOrigin: Region | null = null;
let savedDestination: {latitude: number; longitude: number} | null = null;
let savedOriginLabel: string | null = null;
let savedDestinationLabel: string | null = null;

export const Map = () => {
  // Using saved values to persist data even when moving away from mapview
  const [origin, setOrigin] = useState<Region | null>(savedOrigin);
  const [destination, setDestination] = useState<{latitude: number; longitude: number} | null>(
    savedDestination,
  );
  const [originLabel, setOriginLabel] = useState<string>(savedOriginLabel || '');
  const [destinationLabel, setDestinationLabel] = useState<string>(savedDestinationLabel || '');
  const [deviceLocation, setDeviceLocation] = useState<Region | null>(null);
  const [coordinateInput, setCoordinateInput] = useState('');
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  // New state to track which field is being edited: 'origin' or 'destination'
  const [editingField, setEditingField] = useState<'origin' | 'destination' | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    // Only request location if origin is not already set (to persist state between navigations)
    if (!origin) {
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

        setDeviceLocation(newRegion);
        setOrigin(newRegion);
        savedOrigin = newRegion;
        // Animate to the user's current location
        mapRef.current?.animateToRegion(newRegion, 1000);
      })();
    }
  }, []);

  // Opens search modal
  const openSearch = (field: 'origin' | 'destination') => {
    setEditingField(field);
    setCoordinateInput('');
    setSearchModalVisible(true);
  };

  // Closes search modal
  const closeSearch = () => {
    setSearchModalVisible(false);
    Keyboard.dismiss();
  };

  // Handles selection of coordinate for origin or destination
  const selectCoordinate = (
    field: 'origin' | 'destination',
    latitude: number,
    longitude: number,
    isDevice: boolean = false,
  ) => {
    if (field === 'origin') {
      // Set new origin coordinates
      const newOrigin = {latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01};
      setOrigin(newOrigin);
      savedOrigin = newOrigin;

      // If user selects "Your location", update label
      if (isDevice) {
        setOriginLabel('Your location');
        savedOriginLabel = 'Your location';
      } else {
        const label = `${latitude}, ${longitude}`;
        setOriginLabel(label);
        savedOriginLabel = label;
      }
    }

    if (field === 'destination') {
      // Set new destination coordinates
      const newDestination = {latitude, longitude};
      setDestination(newDestination);
      savedDestination = newDestination;

      // If user selects "Your location", update label
      if (isDevice) {
        setDestinationLabel('Your location');
        savedDestinationLabel = 'Your location';
      } else {
        const label = `${latitude}, ${longitude}`;
        setDestinationLabel(label);
        savedDestinationLabel = label;
      }

      // Ensure origin label is set if it was never set before
      if (!originLabel) {
        setOriginLabel('Your location');
        savedOriginLabel = 'Your location';
      }

      // Ensure destination label is set if it was never set before
      if (!destinationLabel) {
        setDestinationLabel('Your location');
        savedDestinationLabel = 'Your location';
      }
    }

    // Close search modal
    closeSearch();

    // Adjust the map to fit both origin and destination
    if (field === 'origin' && destination) {
      mapRef.current?.fitToCoordinates([{latitude, longitude}, destination], {
        edgePadding: {top: 150, right: 20, bottom: 100, left: 20},
        animated: true,
      });
    }
    if (field === 'destination' && origin) {
      mapRef.current?.fitToCoordinates([origin, {latitude, longitude}], {
        edgePadding: {top: 150, right: 20, bottom: 100, left: 20},
        animated: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={
          origin || {
            latitude: 49.2827,
            longitude: -123.1207,
            latitudeDelta: 2,
            longitudeDelta: 2,
          }
        }
        showsUserLocation
        showsMyLocationButton>
        {destination && origin && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
      </MapView>

      {/* Search Button */}
      <View style={styles.searchContainer}>
        {destination && (
          <Button
            title={originLabel || 'Your location'}
            buttonStyle={styles.searchButton}
            titleStyle={styles.buttonText}
            onPress={() => openSearch('origin')}
          />
        )}
        <Button
          title={
            destination
              ? `${destination.latitude}, ${destination.longitude}`
              : 'Enter "latitude, longitude" for testing)'
          }
          buttonStyle={styles.searchButton}
          titleStyle={styles.buttonText}
          onPress={() => openSearch('destination')}
        />
      </View>

      {/* Search Modal */}
      <Modal visible={searchModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Input
            placeholder={
              editingField === 'origin'
                ? 'Enter origin (latitude, longitude)'
                : 'Enter destination (e.g. 49.2832, -123.1203)'
            }
            value={coordinateInput}
            onChangeText={setCoordinateInput}
            autoFocus
            keyboardType="default"
            containerStyle={styles.inputContainer}
            leftIcon={<Icon name="arrow-back" type="ionicon" onPress={closeSearch} />}
            rightIcon={
              coordinateInput ? (
                <Icon name="close" type="ionicon" onPress={() => setCoordinateInput('')} />
              ) : undefined
            }
          />

          {/* Search Results */}
          {coordinateInput !== '' && (
            <ListItem
              bottomDivider
              onPress={() => {
                const coords = coordinateInput.split(',').map(coord => parseFloat(coord.trim()));
                if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                  selectCoordinate(editingField!, coords[0], coords[1]);
                } else {
                  Alert.alert(
                    'Invalid Input',
                    'Please enter valid coordinates in the format: latitude, longitude',
                  );
                }
              }}>
              <ListItem.Content>
                <ListItem.Title>{coordinateInput}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          )}
          <ListItem
            bottomDivider
            onPress={() => {
              if (deviceLocation) {
                selectCoordinate(
                  editingField!,
                  deviceLocation.latitude,
                  deviceLocation.longitude,
                  true,
                );
              } else {
                Alert.alert('Location not available', "User's current location is not available");
              }
            }}>
            <ListItem.Content>
              <ListItem.Title>Your location</ListItem.Title>
            </ListItem.Content>
          </ListItem>
          {/* Cancel button removed as per instructions */}
        </View>
      </Modal>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
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
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 2,
  },
  searchButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  singleButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'left',
  },
  modalContainer: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: 'white',
  },
  inputContainer: {
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: 'red',
    marginTop: 20,
  },
});
