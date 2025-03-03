import React, {useState, useEffect, useRef, forwardRef, useImperativeHandle} from 'react';
import {StyleSheet, View, Alert, Modal, Keyboard} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import {Button, Input, ListItem, Icon} from '@rneui/themed';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
// UPDATED MAR 3: Import EndRouteDialog
import {EndRouteDialog} from '@/features/map/components/EndRouteDialog';

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

// Save values temporarily so they can be used later even if the app is closed or reloaded
let savedOrigin: Region | null = null;
let savedDestination: {latitude: number; longitude: number} | null = null;
let savedOriginLabel: string | null = null;
let savedDestinationLabel: string | null = null;

export const Map = forwardRef((props, ref) => {
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
  const mapRef = useRef<MapView>(null);
  // NEWER: Ref for the Input so we can force focus when modal opens
  const inputRef = useRef<any>(null);
  // NEWER: State to track if driving mode is active
  const [drivingMode, setDrivingMode] = useState(false);

  // UPDATED MAR 3: State for EndRouteDialog
  const [endDialogStatus, setEndDialogStatus] = useState(false);

  // UPDATED MAR 3: Toggle EndRouteDialog
  const toggleEndRouteDialog = () => {
    setEndDialogStatus(!endDialogStatus);
  };

  // UPDATED MAR 3: Function to handle ending the route
  const handleEndRoute = () => {
    if (mapRef.current && deviceLocation) {
      mapRef.current.animateCamera(
        {
          center: deviceLocation,
          pitch: 0, // Set pitch to 0 (top view)
          heading: 0,
          zoom: 18,
        },
        {duration: 1000},
      );
    }
    setDrivingMode(false);

    // Clear saved values so that a remount starts fresh
    savedOrigin = null;
    savedDestination = null;
    savedOriginLabel = null;
    savedDestinationLabel = null;

    toggleEndRouteDialog();
  };

  // NEWER: useEffect to force focus on input when searchModalVisible becomes true using requestAnimationFrame
  useEffect(() => {
    if (searchModalVisible && inputRef.current) {
      requestAnimationFrame(() => {
        inputRef.current.focus();
      });
    }
  }, [searchModalVisible]);

  // NEWER: Handle map ready - explicitly zoom to user's current location when available
  const handleMapReady = () => {
    console.log('MapView is ready'); // NEWER: Log when Map View is ready
    if (mapRef.current && deviceLocation) {
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: deviceLocation.latitude,
              longitude: deviceLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            1000,
          );
        }
      }, 3000); // UPDATED 28 FEB: Delay zoom-in after map is fully loaded
      setOrigin(deviceLocation);
    }
  };

  // NEWER: onUserLocationChange - animate to user's current location when it changes
  const handleUserLocationChange = (event: any) => {
    const {coordinate} = event.nativeEvent;
    if (mapRef.current && coordinate) {
      console.log('User location changed:', coordinate); // NEWER: Log user location change
      // UPDATED 28 FEB: Only animate if not in driving mode to preserve pitch
      if (!drivingMode) {
        mapRef.current.animateToRegion(
          {
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000,
        );
      }
      setOrigin({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
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
          latitudeDelta: 2,
          longitudeDelta: 2,
        };

        setDeviceLocation(newRegion);
        setOrigin(newRegion);
        savedOrigin = newRegion;
        // Animate to the user's current location
        // mapRef.current?.animateToRegion(newRegion, 1000);
      })();
    }
  }, []);

  // NEWER: Effect to update the map in driving mode with realtime location updates
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
              // UPDATED 28 FEB: Added altitude property to support pitch animation
              mapRef.current.animateCamera(
                {
                  center: {latitude, longitude},
                  pitch: 45, // Slightly angled view
                  heading: heading || 0,
                  zoom: 18, // Adjust zoom level as needed
                  altitude: 150, // UPDATED 28 FEB: Added altitude to support pitch animation
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

    // Adjust the map to fit both origin and destination on the screen
    if (field === 'origin' && destination) {
      mapRef.current?.fitToCoordinates([{latitude, longitude}, destination], {
        edgePadding: {top: 120, right: 20, bottom: 80, left: 20},
        animated: true,
      });
    }
    if (field === 'destination' && origin) {
      mapRef.current?.fitToCoordinates([origin, {latitude, longitude}], {
        edgePadding: {top: 120, right: 20, bottom: 80, left: 20},
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
            latitude: 49.2827, // Defaults to Vancouver
            longitude: -123.1207,
            latitudeDelta: 2,
            longitudeDelta: 2,
          }
        }
        showsUserLocation
        showsMyLocationButton
        pitchEnabled={true} // NEWER: Enable pitch
        rotateEnabled={true} // NEWER: Enable rotation
        onMapReady={handleMapReady} // NEWER: Set onMapReady
        onUserLocationChange={handleUserLocationChange} // NEWER: Set onUserLocationChange
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

      {/* Search Button */}
      {!drivingMode && (
        <View style={styles.searchContainer}>
          {/* {destination && (
          <Button
            title={originLabel || 'Your location'}
            buttonStyle={styles.searchButton}
            titleStyle={styles.buttonText}
            onPress={() => openSearch('origin')}
          />
        )} */}
          {/* <Button
            title={destinationLabel || 'Search here to drive'}
            icon={{
              name: 'map-marker',
              type: 'font-awesome',
              color: 'black',
              size: 20,
              containerStyle: {marginHorizontal: 10},
            }}
            buttonStyle={styles.searchButton}
            titleStyle={styles.buttonText}
            onPress={() => openSearch('destination')}
          /> */}
        </View>
      )}

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

      {/* Start button appears only after destination is entered or deviceLocation is available */}
      <View style={styles.startButtonContainer}>
        {drivingMode ? (
          <Button
            title="End Route"
            onPress={() => {
              console.log('End Route clicked');
              toggleEndRouteDialog(); // UPDATED MAR 3: Open the confirmation dialog
            }}
            buttonStyle={styles.startButton}
            titleStyle={styles.startButtonText}
          />
        ) : (
          (destination || deviceLocation) && (
            <Button
              title="Start Driving"
              onPress={() => {
                console.log('Start Driving clicked');
                setDrivingMode(true);
                if (mapRef.current && deviceLocation) {
                  mapRef.current?.animateCamera(
                    {center: deviceLocation, pitch: 45, heading: 0, zoom: 18, altitude: 150},
                    {duration: 1000},
                  );
                }
              }}
              buttonStyle={styles.startButton}
              titleStyle={styles.startButtonText}
            />
          )
        )}
      </View>

      {/* UPDATED MAR 3: Render EndRouteDialog */}
      <EndRouteDialog
        dialogStatus={endDialogStatus}
        toggleDialog={toggleEndRouteDialog}
        onConfirmEndRoute={handleEndRoute} // Callback when user confirms ending the route
      />
    </View>
  );
});

Map.displayName = 'Map';

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
  // NEW: Styles for the Start button container and button in driving mode
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

export const clearSavedMapValues = () => {
  savedOrigin = null;
  savedDestination = null;
  savedOriginLabel = null;
  savedDestinationLabel = null;
};
