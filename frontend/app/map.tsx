import React, {useState, useEffect, useRef, forwardRef, useImperativeHandle} from 'react';
import {StyleSheet, View, Alert, Modal, Keyboard} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import {Input, ListItem, Icon} from '@rneui/themed';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';

// Get API key from .env
const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_APIKEY ?? '';
console.log('GOOGLE_MAPS_APIKEY:', GOOGLE_MAPS_APIKEY);

// Store base url
const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

// Define the region type to represent a location on the map, including the latitude, longitude, and zoom levels
type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

// Props for managing driving state and status
type Props = {
  setDriveDestinationStatus: (destination: boolean) => void;
  setDriveModeStatus: (mode: boolean) => void;
  startDriveStatus: boolean;
  endDriveStatus: boolean;
};

// Save values temporarily so they can be used later even if the app is closed or reloaded
let savedOrigin: Region | null = null;
let savedDestination: {latitude: number; longitude: number} | null = null;
let savedOriginLabel: string | null = null;
let savedDestinationLabel: string | null = null;

export const Map = forwardRef((props: Props, ref) => {
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
  // State to track which field is being edited (origin or destination)
  const [editingField, setEditingField] = useState<'origin' | 'destination' | null>(null);
  // State to hold autocomplete suggestions (for both origin and destination)
  const [suggestions, setSuggestions] = useState<{description: string; place_id: string}[]>([]);
  // Ref for the MapView instance to control camera
  const mapRef = useRef<MapView>(null);
  // Ref for the Input so we can force focus when modal opens
  const inputRef = useRef<any>(null);
  // State to track if driving mode is active
  const [drivingMode, setDrivingMode] = useState(false);
  // UPDATED 04 MAR: Flag to ensure initial zoom only happens once after the map loads
  const [initialZoom, setInitialZoom] = useState(false);
  // Extracting properties from props related to drive status
  const {setDriveDestinationStatus, setDriveModeStatus, startDriveStatus, endDriveStatus} = props;

  // Updates drive status when destination or driving mode changes
  useEffect(() => {
    setDriveDestinationStatus(destination ? true : false);
    setDriveModeStatus(drivingMode ? true : false);
  }, [destination, drivingMode]);

  // Starts the driving process when status is true
  useEffect(() => {
    if (startDriveStatus) handleStartDriving();
  }, [startDriveStatus]);

  // Ends the driving process if status is true
  useEffect(() => {
    if (endDriveStatus) handleEndDriving();
  }, [endDriveStatus]);

  // Starts driving mode
  const handleStartDriving = () => {
    console.log('Start Driving clicked');
    if (mapRef.current && deviceLocation) {
      mapRef.current.animateCamera(
        {center: deviceLocation, pitch: 45, heading: 0, zoom: 18, altitude: 150},
        {duration: 1000},
      );
    }
    setDrivingMode(true);
  };

  // Ends driving mode
  const handleEndDriving = () => {
    console.log('End Route clicked');
    if (mapRef.current && deviceLocation) {
      mapRef.current.animateCamera(
        {
          center: deviceLocation,
          pitch: 0,
          heading: 0,
          zoom: 18,
        },
        {duration: 1000},
      );
    }
    setDestination(null);
    setDeviceLocation(null);
    setDrivingMode(false);
    savedDestination = null;
    setOrigin(null); // UPDATED 04 MAR: Clear origin state
    savedOrigin = null; // UPDATED 04 MAR: Clear persisted origin
  };

  // useEffect to force focus on input when searchModalVisible becomes true using requestAnimationFrame
  useEffect(() => {
    if (searchModalVisible && inputRef.current) {
      requestAnimationFrame(() => {
        inputRef.current.focus();
      });
    }
  }, [searchModalVisible]);

  // Handle map ready, do nothing to the origin state
  const handleMapReady = () => {
    console.log('MapView is ready'); // Log when Map View is ready
    setOrigin(prev => prev);
  };

  // onUserLocationChange - animate to user's current location when it changes
  const handleUserLocationChange = (event: any) => {
    const {coordinate} = event.nativeEvent;
    if (coordinate) {
      // UPDATED 04 MAR: If driving mode is active, update and log the location.
      if (drivingMode) {
        console.log('User location changed'); // Log user location change
        setOrigin({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
      // UPDATED 04 MAR: If not in driving mode and initial zoom hasn't been done, perform initial zoom.
      else if (!initialZoom) {
        console.log('Zoom to user current location'); // Log the first user location change
        setOrigin({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        mapRef.current?.animateToRegion(
          {
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1500,
        );
        setInitialZoom(true);
      }
    }
  };

  // Function to geocode a place name using Google Geocoding API
  const geocodePlace = async (place: string) => {
    try {
      const response = await fetch(
        `${GOOGLE_MAPS_BASE_URL}/geocode/json?address=${encodeURIComponent(
          place,
        )}&key=${GOOGLE_MAPS_APIKEY}`,
      );
      const data = await response.json();
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {latitude: location.lat, longitude: location.lng};
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // Fetch suggestions when input changes (for both origin and destination)
  useEffect(() => {
    if (editingField !== null && coordinateInput.trim().length > 0) {
      const fetchSuggestions = async () => {
        try {
          const response = await fetch(
            `${GOOGLE_MAPS_BASE_URL}/place/autocomplete/json?input=${encodeURIComponent(
              coordinateInput,
            )}&key=${GOOGLE_MAPS_APIKEY}`,
          );
          const data = await response.json();
          if (data.status === 'OK') {
            setSuggestions(data.predictions);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          console.error(error);
          setSuggestions([]);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [coordinateInput, editingField]);

  // Only request location if origin is not already set (to persist state between navigations)
  useEffect(() => {
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
          latitudeDelta: 2,
          longitudeDelta: 2,
        };
        setDeviceLocation(newRegion);
        setOrigin(newRegion);
        savedOrigin = newRegion;
      })();
    }
  }, []);

  // Effect to update the map in driving mode with realtime location updates
  useEffect(() => {
    let subscription: any;
    if (drivingMode) {
      (async () => {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            distanceInterval: 1,
            timeInterval: 1000,
          },
          location => {
            const {latitude, longitude, heading} = location.coords;
            if (mapRef.current) {
              mapRef.current.animateCamera(
                {
                  center: {latitude, longitude},
                  pitch: 45, // Slightly angled view
                  heading: heading || 0,
                  zoom: 18, // Adjust zoom level as needed
                  altitude: 150, // Added altitude to support pitch animation
                },
                {duration: 1000},
              );
            }
          },
        );
      })();
    }
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [drivingMode]);

  // Expose the openSearch function to parent via ref
  useImperativeHandle(ref, () => ({
    openSearch: (field: 'origin' | 'destination') => {
      setEditingField(field);
      setSearchModalVisible(true);
    },
    clearSearch: () => {
      setCoordinateInput('');
      setDestination(null);
    },
  }));

  // Open search modal
  const openSearch = (field: 'origin' | 'destination') => {
    setEditingField(field);
    // Persist the input value entered
    setCoordinateInput(field === 'origin' ? originLabel : destinationLabel);
    setSearchModalVisible(true);
  };

  // Close search modal
  const closeSearch = () => {
    setSearchModalVisible(false);
    Keyboard.dismiss();
  };

  // Handle selection of coordinates for origin or destination
  // labelOverride to show place name in the button
  const selectCoordinate = (
    field: 'origin' | 'destination',
    latitude: number,
    longitude: number,
    isDevice: boolean = false,
    labelOverride?: string,
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
        const label = labelOverride ? labelOverride : `${latitude}, ${longitude}`;
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
      } else if (labelOverride) {
        setDestinationLabel(labelOverride);
        savedDestinationLabel = labelOverride;
      } else {
        const label = `${latitude}, ${longitude}`;
        setDestinationLabel(label);
        savedDestinationLabel = label;
      }
    }
    // Close search modal
    closeSearch();

    // UPDATED 04 MAR: Calculate region based on origin and destination
    // then animate to display entire route on map
    if (field === 'origin' && destination) {
      const midLat = (latitude + destination.latitude) / 2;
      const midLng = (longitude + destination.longitude) / 2;
      const latDiff = Math.abs(latitude - destination.latitude);
      const lngDiff = Math.abs(longitude - destination.longitude);
      const region = {
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: latDiff * 1.5 || 0.05,
        longitudeDelta: lngDiff * 1.5 || 0.05,
      };
      console.log('Showing recommended route');
      mapRef.current?.animateToRegion(region, 1000);
    }
    if (field === 'destination' && origin) {
      const midLat = (origin.latitude + latitude) / 2;
      const midLng = (origin.longitude + longitude) / 2;
      const latDiff = Math.abs(origin.latitude - latitude);
      const lngDiff = Math.abs(origin.longitude - longitude);
      const region = {
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: latDiff * 1.5 || 0.05,
        longitudeDelta: lngDiff * 1.5 || 0.05,
      };
      console.log('Showing recommended route');
      mapRef.current?.animateToRegion(region, 1000);
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
            latitude: 49.2827, // Defaults to Vancouver
            longitude: -123.1207,
            latitudeDelta: 2,
            longitudeDelta: 2,
          }
        }
        showsUserLocation
        showsMyLocationButton
        pitchEnabled={true} // Enable pitch
        rotateEnabled={true} // Enable rotation
        onMapReady={handleMapReady} // Set onMapReady
        onUserLocationChange={handleUserLocationChange} // Set onUserLocationChange
      >
        {destination && origin && (
          <MapViewDirections
            origin={origin}
            destination={destination}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={4}
            strokeColor="blue"
          />
        )}
        {destination && (
          // Display pin marker for destination
          <Marker coordinate={destination} title="Destination" description={destinationLabel} />
        )}
      </MapView>

      {/* Search Modal */}
      <Modal
        visible={searchModalVisible}
        animationType="slide"
        onShow={() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }}>
        <View style={styles.modalContainer}>
          <Input
            ref={inputRef} // Attach ref for focus control
            placeholder={
              editingField === 'origin'
                ? 'Enter origin (latitude, longitude or place name)'
                : 'Enter destination (e.g. Langara College)'
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
          {coordinateInput !== '' &&
            suggestions.length > 0 &&
            suggestions.map(suggestion => (
              <ListItem
                key={suggestion.place_id}
                bottomDivider
                onPress={() => {
                  (async () => {
                    try {
                      const response = await fetch(
                        `${GOOGLE_MAPS_BASE_URL}/place/details/json?place_id=${suggestion.place_id}&key=${GOOGLE_MAPS_APIKEY}`,
                      );
                      const data = await response.json();
                      if (data.status === 'OK' && data.result) {
                        const location = data.result.geometry.location;
                        const displayLabel = suggestion.description;
                        selectCoordinate(
                          editingField!,
                          location.lat,
                          location.lng,
                          false,
                          displayLabel,
                        );
                      } else {
                        Alert.alert(
                          'Place details not found',
                          'Unable to get details for the selected place.',
                        );
                      }
                    } catch (error) {
                      console.error(error);
                      Alert.alert('Error', 'An error occurred while fetching place details.');
                    }
                  })();
                }}>
                <ListItem.Content>
                  <ListItem.Title>{suggestion.description}</ListItem.Title>
                </ListItem.Content>
              </ListItem>
            ))}
          {coordinateInput !== '' && suggestions.length === 0 && (
            <ListItem
              bottomDivider
              onPress={() => {
                const coords = coordinateInput.split(',').map(coord => parseFloat(coord.trim()));
                if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                  selectCoordinate(editingField!, coords[0], coords[1]);
                } else {
                  (async () => {
                    const result = await geocodePlace(coordinateInput);
                    if (result) {
                      selectCoordinate(
                        editingField!,
                        result.latitude,
                        result.longitude,
                        false,
                        coordinateInput,
                      );
                    } else {
                      Alert.alert('Location not found', 'Please enter a valid place name.');
                    }
                  })();
                }
              }}>
              <ListItem.Content>
                <ListItem.Title>{coordinateInput}</ListItem.Title>
              </ListItem.Content>
            </ListItem>
          )}
          {/* <ListItem
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
          </ListItem> */}
        </View>
      </Modal>
    </View>
  );
});

// Set display name for Map component to avoid errors during debugging
Map.displayName = 'Map';

// Map styles
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
    bottom: 100,
    left: 10,
    right: 10,
    zIndex: 2,
  },
  searchButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
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
    width: '100%',
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
  startButtonContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  startButtonText: {
    fontSize: 16,
    color: 'white',
  },
});
