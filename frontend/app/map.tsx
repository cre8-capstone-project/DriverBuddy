import React, {useState, useEffect, useRef, forwardRef, useImperativeHandle} from 'react';
import {StyleSheet, View, Alert, Modal, Keyboard, TouchableOpacity, Text} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import {Input, ListItem, Icon} from '@rneui/themed';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import {useFaceDetectionContext} from '@/contexts/FaceDetectionProvider';
import {ShowRestStopsDialog} from '@/features/safety-alert/components/ShowRestStopsDialog';
import theme from '@/components/Theme';
import SearchHereToDrive from '@/components/SearchHereToDrive';

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
  // UPDATED 11 MAR: Added flag to disable onUserLocationChange when Nearby Stops is active
  const [disableUserLocationChange, setDisableUserLocationChange] = useState(false);
  // UPDATED 11 MAR: Changed state to store an array of gas stations (instead of a single one)
  const [restStops, setRestStops] = useState<{latitude: number; longitude: number; name: string}[]>(
    [],
  );
  // Extracting properties from props related to drive status
  const {setDriveDestinationStatus, setDriveModeStatus, startDriveStatus, endDriveStatus} = props;
  // UPDATED 04 MAR: Static polyline to prevent the it from blinking when handleUserLocationChange executes
  // const [routeOrigin, setRouteOrigin] = useState<Region | null>(null); // ALPHA DEMO: Removed routeOrigin so the polyline is updated for the demo
  // UPDATED 14 MAR: Show or hide a destination card
  const [showDestinationCard, setShowDestinationCard] = useState(false);
  // UPDATED 14 MAR: For showing/hiding the ShowRestStopsDialog
  const [showRestStopsModal, setShowRestStopsModal] = useState(false);
  // ADDED OR UPDATED 16 MAR: State to track the alertCount when the modal was closed
  const [lastModalAlertCount, setLastModalAlertCount] = useState(0);
  // ADDED OR UPDATED 16 MAR: Show or hide continue driving button
const [showContinueDriving, setShowContinueDriving] = useState(false);
  // ADDED OR UPDATED 16 MAR: State to track the cycle count to trigger modal (separate from alertCount)
  const [cycle, setCycle] = useState(0);
  // UPDATED 14 MAR: Access alertCount and resetAlertCount from FaceDetectionContext
  const {alertCount, resetAlertCount} = useFaceDetectionContext();
  // ADDED OR UPDATED 16 MAR: State to track the previous alertCount when the modal was closed
  const [prevAlertCount, setPrevAlertCount] = useState(alertCount);
  // ADDED OR UPDATED 16 MAR: Update the cycle count
  useEffect(() => {
    if (!showRestStopsModal && drivingMode) {
      const delta = alertCount - prevAlertCount;
      if (delta > 0) {
        setCycle(prev => {
          const cycleCount = prev + delta;
          console.log(`Cycle Count: ${cycleCount}`);
          return cycleCount;
        });
        setPrevAlertCount(alertCount);
      }
    }
  }, [alertCount, drivingMode, showRestStopsModal, prevAlertCount]);

  // ADDED OR UPDATED 16 MAR: Show the rest stop modal when drivingMode: true and cycle count: 3
  useEffect(() => {
    console.log('alertCount:', alertCount); // Preserve original logging
    if (!showRestStopsModal && drivingMode && cycle >= 3) {
      setShowRestStopsModal(true);
    }
  }, [cycle, drivingMode, showRestStopsModal, alertCount]);

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

  // UPDATED 14 MAR: Toggle the destination card
  useEffect(() => {
    if (destination) {
      setShowDestinationCard(true);
    } else {
      setShowDestinationCard(false);
    }
  }, [destination]);

  // Starts driving mode
  const handleStartDriving = () => {
    console.log('Start Driving clicked');
    if (mapRef.current) {
      const currentLocation = deviceLocation || origin; // UPDATED 04 MAR: If deviceLocation is not ready, fallback to origin
      if (currentLocation) {
        mapRef.current.animateCamera(
          {center: currentLocation, pitch: 45, heading: 0, zoom: 18, altitude: 150},
          {duration: 1000},
        );
      }
    }
    setDrivingMode(true);
    // ADDED OR UPDATED 16 MAR: Reset cycle count and prevAlertCount when entering driving mode
    setCycle(0);
    setPrevAlertCount(alertCount);

    // UPDATED 14 MAR: Dismiss the destination card when user clicks Start Driving
    setShowDestinationCard(false);
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
    setDisableUserLocationChange(false); // UPDATED 11 MAR: Flag to disable location change so it won't update
    setRestStops([]); // UPDATED 11 MAR: Set rest stops
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
    if (disableUserLocationChange) return; // UPDATED 11 MAR: Prevent user location from updating and zooming in
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
        console.log('Zoom in to user current location'); // Log the first user location change
        setOrigin({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        // UPDATED 04 MAR: Set static route origin once to prevent blinking of polyline when handleUserLocationChange executes
        // if (!routeOrigin) { // ALPHA DEMO: Removed routeOrigin so the polyline is updated for the demo
        //   setRouteOrigin({
        //     latitude: coordinate.latitude,
        //     longitude: coordinate.longitude,
        //     latitudeDelta: 0.01,
        //     longitudeDelta: 0.01,
        //   });
        // }
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

  // UPDATED 11 MAR: Function to handle Nearby Stops button press using nearbysearch endpoint with radius parameter, displaying ALL gas stations within the perimeter
  const handleNearbyStops = async () => {
    console.log('handleNearbyStops is invoked');
    const currentLocation = deviceLocation || origin;
    if (!currentLocation) {
      Alert.alert('Current location not available');
      return;
    }
    try {
      // Return gas stations within the set perimeter
      const restStopRadius = 10000;
      const restStopType = 'gas_station';
      const restStopKeyword = '';
      const restStopResults = 3;
      const url = `${GOOGLE_MAPS_BASE_URL}/place/nearbysearch/json?location=${encodeURIComponent(
        `${currentLocation.latitude},${currentLocation.longitude}`,
      )}&radius=${restStopRadius}&type=${restStopType}&keyword=${restStopKeyword}&key=${GOOGLE_MAPS_APIKEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        // Map and calculate distance to each station
        const allStations = data.results.map((result: any) => {
          const stationLat = result.geometry.location.lat;
          const stationLng = result.geometry.location.lng;

          // Calculate distance (simple Euclidean distance for simplicity)
          const distance = Math.sqrt(
            Math.pow(stationLat - currentLocation.latitude, 2) +
              Math.pow(stationLng - currentLocation.longitude, 2),
          );

          return {
            latitude: stationLat,
            longitude: stationLng,
            name: result.name,
            distance: distance, // Store the distance for sorting
          };
        });

        // Sort stations by distance and get up to 5 nearest stations
        const nearestStations = allStations
          .sort((a, b) => a.distance - b.distance)
          .slice(0, restStopResults);

        // Set nearest stations
        setRestStops(nearestStations);

        // Include current location in the region boundary calculations
        const latitudes = [currentLocation.latitude, ...nearestStations.map(s => s.latitude)];
        const longitudes = [currentLocation.longitude, ...nearestStations.map(s => s.longitude)];

        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);

        const midLat = (minLat + maxLat) / 2;
        const midLng = (minLng + maxLng) / 2;

        // Add padding to the region delta for better visibility
        const latitudeDelta = (maxLat - minLat) * 1.5 || 0.05;
        const longitudeDelta = (maxLng - minLng) * 1.5 || 0.05;

        const region = {
          latitude: midLat,
          longitude: midLng,
          latitudeDelta,
          longitudeDelta,
        };
        // Zoom out to show nearby rest stops
        console.log('Zoom out to show nearby rest stops');
        mapRef.current?.animateToRegion(region, 1000);
        setDisableUserLocationChange(true);

        // ADDED OR UPDATED 16 MAR: Display continue driving button after rest stops are shown
        setShowContinueDriving(true);
      } else {
        Alert.alert('No gas stations found nearby');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while fetching nearby gas stations.');
    }
  };

  // ADDED OR UPDATED 16 MAR: Actions when user clicks YES on modal
  const handleRestStopsYes = () => {
    console.log('User clicked YES on map.tsx');
    setShowRestStopsModal(false);
    setCycle(0);
    setPrevAlertCount(alertCount);
    setLastModalAlertCount(alertCount); // Reset the trigger counter when modal is dismissed
    if (mapRef.current && deviceLocation) {
      mapRef.current.animateCamera(
        {center: deviceLocation, pitch: 0, heading: 0, zoom: 18},
        {duration: 1000},
      );
    }
    handleNearbyStops();
  };

  // ADDED OR UPDATED 16 MAR: Actions when user clicks NO on modal
  const handleRestStopsNo = (autoClosed?: boolean) => {
    if (autoClosed) {
      console.log('Modal has auto closed'); // Log auto-close message
    } else {
      console.log('User clicked NO on map.tsx');
    }
    setShowRestStopsModal(false);
    setCycle(0);
    setPrevAlertCount(alertCount);
    setLastModalAlertCount(alertCount); // Reset the trigger counter on dismissal
  };

  // ADDED OR UPDATED 16 MAR: Logic for continue driving
  const handleContinueDriving = () => {
    console.log('Continue driving pressed');
    setRestStops([]); // Clear rest stop pins
    // setDrivingMode(true);

    const currentLocation = deviceLocation || origin;
    if (mapRef.current && currentLocation) {
      mapRef.current.animateCamera(
        {center: currentLocation, pitch: 45, heading: 0, zoom: 18, altitude: 150},
        {duration: 1000},
      );
    }
    // Hide continue driving button
    setShowContinueDriving(false);
  };

  // Function to geocode a place name using Google Geocoding API
  const geocodePlace = async (place: string) => {
    try {
      const response = await fetch(
        `${GOOGLE_MAPS_BASE_URL}/geocode/json?address=${encodeURIComponent(place)}&key=${GOOGLE_MAPS_APIKEY}`,
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
            `${GOOGLE_MAPS_BASE_URL}/place/autocomplete/json?input=${encodeURIComponent(coordinateInput)}&key=${GOOGLE_MAPS_APIKEY}`,
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

  // ADDED OR UPDATED 16 MAR: Close the destination card and zoom back to origin
  const closeDestinationCard = () => {
    setDestination(null);
    savedDestination = null;
    setShowDestinationCard(false);
    if (mapRef.current && origin) {
      mapRef.current.animateCamera(
        {
          center: origin,
          pitch: 0,
          heading: 0,
          zoom: 18,
        },
        {duration: 1000},
      );
    }
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

    // UPDATED 04 MAR: When a destination is selected, if no static route origin has been set yet, store the current origin
    // if (!routeOrigin && origin) { // ALPHA DEMO: Removed routeOrigin so the polyline is updated for the demo
    //   setRouteOrigin(origin);
    // }

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
      console.log('Show recommended route using latitude and destination');
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
      console.log('Show recommended route using origin and latitude');
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
        showsUserLocation={true} // Show user location
        showsMyLocationButton={true} // Show user location button
        showsCompass={true} // Show compass
        pitchEnabled={true} // Enable pitch
        rotateEnabled={true} // Enable rotation
        onMapReady={handleMapReady} // Set onMapReady
        onUserLocationChange={handleUserLocationChange} // Set onUserLocationChange
        userLocationFastestInterval={100} // Update users location in milliseconds
      >
        {destination && origin && (
          <MapViewDirections
            // origin={routeOrigin || origin} // UPDATED 04 MAR: Use static route origin if available
            origin={origin} // ALPHA DEMO: Removed routeOrigin so the polyline is updated for the demo
            destination={destination}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={6}
            strokeColor={theme.lightColors.primary}
            // UPDATED 07 MAR: Added props
            mode="DRIVING" // Allowed values are DRIVING, BICYCLING, WALKING, and TRANSIT
            resetOnChange={false} // Prevents polyline from blinking when updating
            splitWaypoints={true} // Split waypoints to multiple routes to prevent higher Google costs
          />
        )}
        {destination && (
          // Display pin marker for destination
          <Marker coordinate={destination} title="Destination" description={destinationLabel} />
        )}
        {/* UPDATED 11 MAR: Render markers for ALL gas stations */}
        {restStops.map((station, index) => (
          <Marker
            key={`gas-${index}`}
            coordinate={{latitude: station.latitude, longitude: station.longitude}}
            title={station.name}
          />
        ))}
      </MapView>
      {/* UPDATED 14 MAR: Nearby Stops (Test) button
      {drivingMode && (
        <View style={styles.nearbyStopsButtonContainer}>
          <TouchableOpacity style={styles.nearbyStopsButton} onPress={handleNearbyStops}>
            <Text>Nearby Stops (Test)</Text>
          </TouchableOpacity>
        </View>
      )}
      */}

      {/* ADDED OR UPDATED 16 MAR: Continue driving button */}
      {showContinueDriving && (
        <View style={styles.continueDrivingButtonContainer}>
          <TouchableOpacity style={styles.continueDrivingButton} onPress={handleContinueDriving}>
            <Icon name="navigate" type="ionicon" size={20} />
            <Text style={styles.continueDrivingButtonText}>Continue driving</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ADDED OR UPDATED 16 MAR: Show rest stops modal */}
      {showRestStopsModal && (
        <ShowRestStopsDialog
          isVisible={showRestStopsModal}
          onConfirmYes={handleRestStopsYes}
          onConfirmNo={handleRestStopsNo}
        />
      )}

      {/* UPDATED 14 MAR: Destination card */}
      {showDestinationCard && (
        <View style={styles.destinationCard}>
          <Text style={styles.destinationCardText}>{destinationLabel}</Text>
          <TouchableOpacity style={styles.destinationCardClose} onPress={closeDestinationCard}>
            <Icon name="close-circle-outline" type="ionicon" />
          </TouchableOpacity>
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
                <Icon
                  name="close-circle-outline"
                  type="ionicon"
                  onPress={() => setCoordinateInput('')}
                />
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
    paddingTop: 10,
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
    backgroundColor: theme.lightColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  startButtonText: {
    fontSize: 16,
    color: 'white',
  },
  // UPDATED 11 MAR: Nearby Stops button container style
  nearbyStopsButtonContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  // UPDATED 11 MAR: Nearby Stops button style
  nearbyStopsButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
  },

  // UPDATED 14 MAR: Destination card
  destinationCard: {
    position: 'absolute',
    bottom: 96,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 10,
    paddingLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.lightColors.grey3,
  },
  destinationCardText: {
    flex: 1,
    fontSize: 16,
    marginRight: 10,
  },
  destinationCardClose: {
    padding: 5,
  },

  // ADDED OR UPDATED 16 MAR: Continue driving button
  continueDrivingButtonContainer: {
    position: 'absolute',
    bottom: 110,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  continueDrivingButton: {
    backgroundColor: theme.lightColors.white,
    paddingVertical: 16,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueDrivingButtonText: {
    fontSize: 19,
    fontWeight: '400',
    paddingLeft: 6,
  },
});
