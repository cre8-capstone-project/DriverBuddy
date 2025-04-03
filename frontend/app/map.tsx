import React, {useState, useEffect, useRef, forwardRef, useImperativeHandle} from 'react';
import {
  StyleSheet,
  View,
  Alert,
  Modal,
  Keyboard,
  TouchableOpacity,
  Text,
  Image,
  Animated,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import {Input, ListItem, Icon} from '@rneui/themed';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import {useFaceDetectionContext} from '@/contexts/FaceDetectionProvider';
import {ShowRestStopsDialog} from '@/features/map/components/ShowRestStopsDialog';
import theme from '@/components/Theme';
import type {ViewModeType} from '@/types/ViewModeType'; // ADDED OR UPDATED 19 MAR: Import ViewModeType
import {
  restStopType,
  restStopCount,
  alertMsgAndSound,
  updateMapSettings,
} from '@/features/map/constants/settings'; // ADDED OR UPDATED 19 MAR: Import settings
import {getSettings} from '@/services/SettingsService';
import {usePlaySound} from '@/hooks/usePlaySound';
import {INSTRUCTION_MESSAGE} from '@/features/safety-alert/constants/messages';
import AddRestStopPanel from '@/features/map/components/AddRestStopPanel'; // ADDED OR UPDATED 27 MAR: Import AddRestStopPanel

// Get API key from .env
const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_APIKEY ?? '';
console.log('GOOGLE_MAPS_APIKEY:', GOOGLE_MAPS_APIKEY);

// Store base url
const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

// ADDED OR UPDATED 28 MAR: Helper function to check if the rest stop waypoint has been passed
function distanceBetween(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Simple Haversine or approximate distance. Example:
  const R = 6371e3; // Earth radius in meters
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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
  setViewMode: (mode: ViewModeType) => void; // ADDED OR UPDATED 19 MAR: Accept setViewMode
  setViewModeContext: (mode: ViewModeType) => void; // ADDED OR UPDATED 19 MAR: Accept setViewModeContext
  viewMode: ViewModeType; // ADDED OR UPDATED 27 MAR: Identify the thumbnail view (cameraView or mapView)
  onShowRestStopPanel?: (
    station: {latitude: number; longitude: number; name: string} | null,
  ) => void; // ADDED OR UPDATED 27 MAR: Callback to tell journey.tsx when to show AddRestStopPanel
  onToggleNav?: (hide: boolean) => void; // // ADDED OR UPDATED 01 APR: Prop to toggle nav container in journey.tsx
};

// Save values temporarily so they can be used later even if the app is closed or reloaded
let savedOrigin: Region | null = null;
let savedDestination: {latitude: number; longitude: number} | null = null;
let savedOriginLabel: string | null = null;
let savedDestinationLabel: string | null = null;

// ADDED OR UPDATED 28 MAR: Customize pins for rest stop types
const restStopIcons: {[key: string]: any} = {
  gas_station: require('@/assets/images/gas-station-pin.png'),
  lodging: require('@/assets/images/lodging-pin.png'),
  convenience_store: require('@/assets/images/convenience-store-pin.png'),
  default: require('@/assets/images/rest-stop-pin.png'),
};

export const Map = forwardRef((props: Props, ref) => {
  // ADDED OR UPDATED 28 MAR: State to store the current rest stop pin icon
  const [restStopIcon, setRestStopIcon] = useState(require('@/assets/images/rest-stop-pin.png'));
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
  // ADDED OR UPDATED 16 MAR: Temporarily disable the driving watch position if true
  const [disableDrivingWatchPosition, setDisableDrivingWatchPosition] = useState(false);
  // UPDATED 04 MAR: Flag to ensure initial zoom only happens once after the map loads
  const [initialZoom, setInitialZoom] = useState(false);
  // UPDATED 11 MAR: Added flag to disable onUserLocationChange when Nearby Stops is active
  const [disableUserLocationChange, setDisableUserLocationChange] = useState(false);
  // UPDATED 11 MAR: Changed state to store an array of gas stations (instead of a single one)
  const [restStops, setRestStops] = useState<{latitude: number; longitude: number; name: string}[]>(
    [],
  );
  // Extracting properties from props related to drive status
  const {
    setDriveDestinationStatus,
    setDriveModeStatus,
    startDriveStatus,
    endDriveStatus,
    setViewMode, // ADDED OR UPDATED 19 MAR: Destructure setViewMode
    setViewModeContext, // ADDED OR UPDATED 19 MAR: Destructure setViewModeContext
  } = props;
  // UPDATED 04 MAR: Static polyline to prevent the it from blinking when handleUserLocationChange executes
  // const [routeOrigin, setRouteOrigin] = useState<Region | null>(null); // ALPHA DEMO: Removed routeOrigin so the polyline is updated for the demo
  // UPDATED 14 MAR: Show or hide a destination card
  const [showDestinationCard, setShowDestinationCard] = useState(false);

  // ADDED OR UPDATED 31 MAR: Use name instead of label for consistency
  const [destinationStation, setDestinationStation] = useState<{
    name?: string;
    photos?: {photo_reference: string}[];
    vicinity?: string;
  } | null>(null);

  // ADDED OR UPDATED 31 MAR: Distance and duration to destination
  const [destinationMetrics, setDestinationMetrics] = useState<{
    distance: number;
    duration: number;
  } | null>(null);

  // ADDED OR UPDATED 02 APR: Animation value for Resume Driving button
  const resumeDrivingAnim = useRef(new Animated.Value(0)).current;

  // UPDATED 14 MAR: For showing/hiding the ShowRestStopsDialog
  const [showRestStopsModal, setShowRestStopsModal] = useState(false);
  // ADDED OR UPDATED 16 MAR: State to track the alertCount when the modal was closed
  const [lastModalAlertCount, setLastModalAlertCount] = useState(0);
  // ADDED OR UPDATED 16 MAR: Show or hide continue driving button
  const [showContinueDriving, setShowContinueDriving] = useState(false);
  // ADDED OR UPDATED 16 MAR: State to track the cycle count to trigger modal (separate from alertCount)
  const [cycle, setCycle] = useState(0);
  // UPDATED 14 MAR: Access alertCount and resetAlertCount from FaceDetectionContext
  const {alertCount, soundData, setAlertStatus, setOperationStatus} = useFaceDetectionContext();
  // ADDED OR UPDATED 16 MAR: State to track the previous alertCount when the modal was closed
  const [prevAlertCount, setPrevAlertCount] = useState(alertCount);
  const {playSound} = usePlaySound();
  // ADDED OR UPDATED 26 MAR: Show or hide rest stops button
  const [showRestStopsButton, setShowRestStopsButton] = useState(false);

  // ADDED OR UPDATED 26 MAR: Extract string until comma delimeter
  const getCommaTruncated = (fullString: string): string => {
    if (!fullString) return '';
    return fullString.split(',')[0];
  };

  // ADDED OR UPDATED 26 MAR: Helper to convert color to rgba and 50% opacity
  const hexToRGBA = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // ADDED OR UPDATED 26 MAR: Rest stop polyline color
  const restStopRouteColor = hexToRGBA('#7889b9', 1); // 60% of primary color
  // const restStopRouteColor = hexToRGBA('#00FFFF', 1); // Sky cyan from brand color palette
  // const restStopRouteColor = hexToRGBA('#88FF68', 1); // Accent color from brand color palette

  // ADDED OR UPDATED 27 MAR: State for managing rest stop interaction
  type RestStop = {latitude: number; longitude: number; name: string};
  const [selectedRestStop, setSelectedRestStop] = useState<RestStop | null>(null);
  const [showAddRestStopPanel, setShowAddRestStopPanel] = useState(false);
  const [routeWaypoints, setRouteWaypoints] = useState<{latitude: number; longitude: number}[]>([]);
  const [pinnedRestStop, setPinnedRestStop] = useState<RestStop | null>(null);

  // ADDED OR UPDATED 27 MAR: Function to handle rest stop pin press
  const handleRestStopPress = (station: {latitude: number; longitude: number; name: string}) => {
    console.log('User tapped rest stop:', station.name);
    setSelectedRestStop(station);
    // ADDED OR UPDATED 27 MAR: Trigger callback instead of invoking add rest stop panel
    // setShowAddRestStopPanel(true);
    if (props.onShowRestStopPanel) {
      props.onShowRestStopPanel(station);
    }
  };

  // ADDED OR UPDATED 27 MAR: Handlers for adding or canceling a rest stop
  const handleAddRestStopYes = () => {
    setRestStops([]);
    if (selectedRestStop) {
      setRouteWaypoints(prev => [
        ...prev,
        {
          latitude: selectedRestStop.latitude,
          longitude: selectedRestStop.longitude,
        },
      ]);
      setPinnedRestStop(selectedRestStop);
    }
    setShowAddRestStopPanel(false);
    setSelectedRestStop(null);
  };

  const handleAddRestStopNo = () => {
    setShowAddRestStopPanel(false);
    setSelectedRestStop(null);
  };

  // ADDED OR UPDATED 21 MAR: Load persisted settings on mount
  useEffect(() => {
    async function loadPersistedSettings() {
      const persisted = await getSettings();
      if (persisted && persisted.restStopTypes && persisted.restStopTypes.length > 0) {
        updateMapSettings(
          persisted.restStopTypes[0].toString(),
          persisted.restStopCount,
          persisted.alertMsgAndSound.toString(),
        );
      }
    }
    loadPersistedSettings();
  }, []);

  // ADDED OR UPDATED 16 MAR: Update the cycle count, only increment if disableDrivingWatchPosition is false
  useEffect(() => {
    if (!showRestStopsModal && drivingMode && !disableDrivingWatchPosition) {
      // ADDED OR UPDATED 24 MAR: If alertCount was reset due to unmounting of alert detection, re-sync prevAlertCount
      if (alertCount < prevAlertCount) {
        setCycle(0);
        setPrevAlertCount(alertCount);
      } else {
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
    }
  }, [alertCount, drivingMode, disableDrivingWatchPosition, showRestStopsModal, prevAlertCount]);

  // ADDED OR UPDATED 16 MAR: Show the rest stop modal when drivingMode: true and cycle count: 3
  useEffect(() => {
    console.log('alertCount:', alertCount);
    // ADDED OR UPDATED 16 MAR: Added disableDrivingWatchPosition so modal won't appear while rest stops are displayed
    if (!showRestStopsModal && drivingMode && !disableDrivingWatchPosition && cycle >= 3) {
      setShowRestStopsModal(true);
      setPrevAlertCount(alertCount); // ADDED OR UPDATED 16 MAR: Reset prevAlertCount to prevent unwanted cycleCount increments
      playSound(INSTRUCTION_MESSAGE[1].voice);
    }
  }, [cycle, drivingMode, disableDrivingWatchPosition, showRestStopsModal, alertCount]);

  useEffect(() => {
    if (showRestStopsModal && soundData) {
      console.log('[DEBUG] Rest stop modal is open. Cancel playing sound');
      soundData?.stopAsync();
      soundData?.unloadAsync();
    }
  }, [showRestStopsModal, soundData]);

  useEffect(() => {
    if (showRestStopsModal) {
      console.log('[DEBUG] Pause detection start.');
      setAlertStatus(true);
    } else {
      console.log('[DEBUG] Pause detection end.');
      setAlertStatus(false);
    }
  }, [showRestStopsModal]);

  // Updates drive status when destination or driving mode changes
  useEffect(() => {
    setDriveDestinationStatus(destination ? true : false);
    setDriveModeStatus(drivingMode ? true : false);

    // ADDED OR UPDATED 19 MAR: Switch to map view when destination is selected
    if (destination) {
      setTimeout(() => {
        setViewMode('mapView');
        setViewModeContext('mapView');
      }, 500); // ADDED OR UPDATED 03 APR: Add delay before switching to mapView
    }
  }, [destination, drivingMode, setViewMode, setViewModeContext]);

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
          {center: currentLocation, pitch: 45, heading: 0, zoom: 19, altitude: 150},
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

    // ADDED OR UPDATED 26 MAR: Show rest stops button
    setShowRestStopsButton(true);
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
          zoom: 19,
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
        // console.log('User location changed'); // Log user location change
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
          1000,
        );
        setInitialZoom(true);
      }
    }
  };

  // ADDED OR UPDATED 28 MAR: Remove rest stop waypoint when it has been passed
  useEffect(() => {
    if (!drivingMode || routeWaypoints.length === 0 || !origin) return;
    const threshold = 30; // 30 meters from the waypoint will remove it from the route
    const [firstWaypoint, ...others] = routeWaypoints;
    const dist = distanceBetween(
      origin.latitude,
      origin.longitude,
      firstWaypoint.latitude,
      firstWaypoint.longitude,
    );
    if (dist < threshold) {
      setRouteWaypoints(others);
      setPinnedRestStop(null);
      console.log('Passed the waypoint, removing it from routeWaypoints');
    }
  }, [origin, drivingMode, routeWaypoints]);

  // UPDATED 11 MAR: Function to handle Nearby Stops button press using nearbysearch endpoint with radius parameter, displaying ALL gas stations within the perimeter
  const handleNearbyStops = async () => {
    console.log('handleNearbyStops is invoked');
    const currentLocation = deviceLocation || origin;
    if (!currentLocation) {
      Alert.alert('Current location not available');
      return;
    }
    try {
      // Return rest stops with these parameters
      const restStopRadius = 10000;
      // const restStopType = 'gas_station';
      const restStopKeyword = '';
      // const restStopResults = 3;

      // ADDED OR UPDATED 19 MAR: Mapping IDs to API type strings
      const restStopTypeMap: {[key: number]: string} = {
        1: 'gas_station',
        2: 'lodging',
        3: 'convenience_store',
      };
      const alertSoundMap: {[key: number]: string} = {
        1: 'Standard',
        2: 'Comical',
      };

      const numericRestStopType = parseInt(restStopType, 10);
      const numericAlertSound = parseInt(alertMsgAndSound, 10);

      const mappedRestStopType = restStopTypeMap[numericRestStopType] || restStopType;
      const mappedAlertSound = alertSoundMap[numericAlertSound] || alertMsgAndSound;

      console.log(`Type of Rest Stop: ${mappedRestStopType}`);
      console.log(`Number of Rest Stops: ${restStopCount}`);
      console.log(`Alert Message & Sound: ${mappedAlertSound}`);

      // console.log(`Types of Rest Stops: ${restStopType}`);
      // console.log(`Number of Rest Stops: ${restStopCount}`);
      // console.log(`Alert Message & Sound: ${alertMsgAndSound}`);

      // ADDED OR UPDATED 28 MAR: Mapping of icons to rest stop types
      const pinImage = restStopIcons[mappedRestStopType] || restStopIcons.default;
      setRestStopIcon(pinImage);

      const url = `${GOOGLE_MAPS_BASE_URL}/place/nearbysearch/json?location=${encodeURIComponent(
        `${currentLocation.latitude},${currentLocation.longitude}`,
      )}&radius=${restStopRadius}&type=${mappedRestStopType}&keyword=${restStopKeyword}&key=${GOOGLE_MAPS_APIKEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        // ADDED OR UPDATED 21 MAR: Filter results to only include open rest stops
        const openResults = data.results.filter(
          (result: any) => result.opening_hours && result.opening_hours.open_now,
        );
        if (openResults.length === 0) {
          Alert.alert('No open rest stops found nearby');
          return;
        }

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
            photos: result.photos,
            vicinity: result.vicinity,
            distance: distance, // Store the distance for sorting
          };
        });

        // Sort stations by distance and get up to 5 nearest stations
        const nearestStations = allStations
          .sort((a, b) => a.distance - b.distance)
          .slice(0, restStopCount);

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
        const latitudeDelta = (maxLat - minLat) * 1.8 || 0.05;
        const longitudeDelta = (maxLng - minLng) * 1.8 || 0.05;

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
        // ADDED OR UPDATED 16 MAR: Turn off driving watch position so the camera won't zoom to user's location, and reset counters
        console.log('disableDrivingWatchPosition is TRUE');
        setCycle(0);
        setPrevAlertCount(alertCount);
        setDisableDrivingWatchPosition(true);

        // ADDED OR UPDATED 02 APR: Slide Resume Driving button down
        resumeDrivingAnim.stopAnimation(() => {
          Animated.timing(resumeDrivingAnim, {
            toValue: 60,
            duration: 400,
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished) {
              // Hide the button AFTER the animation completes
              setShowRestStopsButton(false);
            }
          });
        });

        // ADDED OR UPDATED 26 MAR: Hide rest stops button
        // setShowRestStopsButton(false);

        // ADDED OR UPDATED 16 MAR: Display continue driving button after rest stops are shown
        setShowContinueDriving(true);

        // ADDED OR UPDATED 01 APR: Hide navContainer in journey.tsx when rest stops are shown
        if (props.onToggleNav) {
          props.onToggleNav(true);
        }

        setOperationStatus(true);
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
    // Reset counters first
    setCycle(0);
    setPrevAlertCount(alertCount);
    setLastModalAlertCount(alertCount);
    // Then close the modal
    setShowRestStopsModal(false);

    // ADDED OR UPDATED 02 APR: Slide Resume Driving button down
    setTimeout(() => {
      resumeDrivingAnim.stopAnimation(() => {
        Animated.timing(resumeDrivingAnim, {
          toValue: 60,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 700);

    if (mapRef.current && deviceLocation) {
      mapRef.current.animateCamera(
        {center: deviceLocation, pitch: 0, heading: 0, zoom: 19},
        {duration: 1000},
      );
    }
    handleNearbyStops();
    // ADDED OR UPDATED 27 MAR: Switch to map view when displaying rest stops
    setViewMode('mapView');
    setViewModeContext('mapView');
  };

  // ADDED OR UPDATED 16 MAR: Actions when user clicks NO on modal
  const handleRestStopsNo = (autoClosed?: boolean) => {
    if (autoClosed) {
      console.log('Modal has auto closed'); // Log auto-close message
    } else {
      console.log('User clicked NO on map.tsx');
    }
    // Reset counters first
    setCycle(0);
    setPrevAlertCount(alertCount);
    setLastModalAlertCount(alertCount);
    // Then close the modal
    setShowRestStopsModal(false);
  };

  // ADDED OR UPDATED 16 MAR: Logic for continue driving
  const handleContinueDriving = () => {
    console.log('Continue driving pressed');
    // Clear rest stop pins
    setRestStops([]);
    // ADDED OR UPDATED 16 MAR: Re-enable driving mode, just in case it's disabled
    setDrivingMode(true);
    // ADDED OR UPDATED 16 MAR: Turn on driving watch position again so the camera zooms to user's location, and reset counters
    console.log('disableDrivingWatchPosition is FALSE');
    setDisableDrivingWatchPosition(false);
    setCycle(0);
    setPrevAlertCount(alertCount);

    // ADDED OR UPDATED 23 MAR: Re-enable user location updates so route updates
    console.log('disableDrivingWatchPosition is FALSE');
    setDisableUserLocationChange(false);

    const currentLocation = deviceLocation || origin;
    if (mapRef.current && currentLocation) {
      mapRef.current.animateCamera(
        {center: currentLocation, pitch: 45, heading: 0, zoom: 19, altitude: 150},
        {duration: 1000},
      );
    }

    // ADDED OR UPDATED 02 APR: Slide Resume Driving button back up
    resumeDrivingAnim.stopAnimation(() => {
      Animated.timing(resumeDrivingAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    });

    // Hide continue driving button
    setShowContinueDriving(false);

    // ADDED OR UPDATED 26 MAR: Show rest stops button
    setShowRestStopsButton(true);

    setOperationStatus(false);

    // ADDED OR UPDATED 01 APR: Unhide navContainer in journey.tsx
    if (props.onToggleNav) {
      props.onToggleNav(false);
    }
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
  // useEffect(() => {
  //   if (!origin) {
  //     (async () => {
  //       let {status} = await Location.requestForegroundPermissionsAsync();
  //       if (status !== 'granted') {
  //         Alert.alert(
  //           'Permission Denied',
  //           'Please allow location access to show your position on the map.',
  //         );
  //         return;
  //       }
  //       let currentLocation = await Location.getCurrentPositionAsync({});
  //       const newRegion = {
  //         latitude: currentLocation.coords.latitude,
  //         longitude: currentLocation.coords.longitude,
  //         latitudeDelta: 2,
  //         longitudeDelta: 2,
  //       };
  //       setDeviceLocation(newRegion);
  //       setOrigin(newRegion);
  //       savedOrigin = newRegion;
  //     })();
  //   }
  // }, []);

  // ADDED OR UPDATED 31 MAR: Request location and delay zoom in to map until permission is granted
  useEffect(() => {
    (async () => {
      // Skip if origin is available
      if (savedOrigin) return;

      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          "The map won't track your location until you allow location access.",
        );
        return;
      }

      // Once permission is granted, get the current location:
      const currentLocation = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 2,
        longitudeDelta: 2,
      };
      setDeviceLocation(newRegion);
      setOrigin(newRegion);
      savedOrigin = newRegion;

      // Give the map a small delay to mount before animating:
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      }, 500);
    })();
  }, []);

  // Effect to update the map in driving mode with realtime location updates
  useEffect(() => {
    let subscription: any;
    // ADDED OR UPDATED 16 MAR: Skip driving watch position if true
    if (drivingMode && !disableDrivingWatchPosition) {
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
                  zoom: 19, // Adjust zoom level as needed
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
  }, [drivingMode, disableDrivingWatchPosition]);

  // ADDED OR UPDATED 16 MAR: Reset counters when the modal closes
  // Prevents unwanted cycleCount increments while the modal is open
  const wasModalOpen = useRef(false);

  useEffect(() => {
    if (showRestStopsModal && !wasModalOpen.current) {
      // Modal is opening
      wasModalOpen.current = true;
    } else if (!showRestStopsModal && wasModalOpen.current) {
      // Modal is closing
      wasModalOpen.current = false;

      // Force reset counters when the modal closes
      setCycle(0);
      setPrevAlertCount(alertCount);
      setLastModalAlertCount(alertCount);
    }
  }, [showRestStopsModal, alertCount]);

  // Expose the openSearch function to parent via ref
  useImperativeHandle(ref, () => ({
    openSearch: (field: 'origin' | 'destination') => {
      setEditingField(field);
      setSearchModalVisible(true);
      setOperationStatus(true);
    },
    clearSearch: () => {
      setCoordinateInput('');
      setDestination(null);

      // ADDED OR UPDATED 24 MAR: Clear savedDestination when invoking clearSearch
      savedDestination = null;
    },

    // ADDED OR UPDATED 28 MAR: Expose addWaypoint to update the route with ONE selected rest stop
    addWaypoint: (station: {latitude: number; longitude: number; name: string} | null) => {
      // Remove all displayed rest stops pins
      setRestStops([]);
      // Then add station as a waypoint while replacing any existing waypoint
      if (station) {
        setRouteWaypoints([{latitude: station.latitude, longitude: station.longitude}]);
        setPinnedRestStop(station);

        // Zoom out to show the updated route with the added rest stop
        // ADDED OR UPDATED 29 MAR: Zoom out to show only origin and station
        if (origin && station) {
          const allLats = [origin.latitude, station.latitude];
          const allLngs = [origin.longitude, station.longitude];
          const minLat = Math.min(...allLats);
          const maxLat = Math.max(...allLats);
          const minLng = Math.min(...allLngs);
          const maxLng = Math.max(...allLngs);
          const midLat = (minLat + maxLat) / 2;
          const midLng = (minLng + maxLng) / 2;
          const latitudeDelta = (maxLat - minLat) * 1.8 || 0.05;
          const longitudeDelta = (maxLng - minLng) * 1.8 || 0.05;
          const region = {
            latitude: midLat,
            longitude: midLng,
            latitudeDelta,
            longitudeDelta,
          };
          mapRef.current?.animateToRegion(region, 1000);
        }
      }
    },
  }));

  // ADDED OR UPDATED 27 MAR: Clear savedDestination when map unmounts
  useEffect(() => {
    return () => {
      console.log('Map unmounted, reset savedDestination');
      savedDestination = null;
    };
  }, []);

  // Open search modal
  const openSearch = (field: 'origin' | 'destination') => {
    setEditingField(field);
    // Persist the input value entered
    setCoordinateInput(field === 'origin' ? originLabel : destinationLabel);
    setSearchModalVisible(true);
    setOperationStatus(true);
  };

  // Close search modal
  const closeSearch = () => {
    setSearchModalVisible(false);
    setOperationStatus(false);
    Keyboard.dismiss();
  };

  // ADDED OR UPDATED 01 APR: Add delay to ensure input is mounted before calling focus
  // Fixes the keyboard not showing up when searching for a destination
  useEffect(() => {
    if (searchModalVisible && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 500);
    }
  }, [searchModalVisible]);

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
          zoom: 19,
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
        latitudeDelta: latDiff * 1.8 || 0.05,
        longitudeDelta: lngDiff * 1.8 || 0.05,
      };
      console.log('Show recommended route using latitude and destination');
      mapRef.current?.animateToRegion(region, 1000);
    }
    if (field === 'destination' && origin) {
      // const midLat = (origin.latitude + latitude) / 2;
      // const midLng = (origin.longitude + longitude) / 2;
      // const latDiff = Math.abs(origin.latitude - latitude);
      // const lngDiff = Math.abs(origin.longitude - longitude);
      // const region = {
      //   latitude: midLat,
      //   longitude: midLng,
      //   latitudeDelta: latDiff * 1.8 || 0.05,
      //   longitudeDelta: lngDiff * 1.8 || 0.05,
      // };
      console.log('Show recommended route using origin and latitude');
      // ADDED OR UPDATED 31 MAR: Delay map zoom until showDestinationCard is rendered
      setTimeout(() => {
        // mapRef.current?.animateToRegion(region, 1000);
        // ADDED OR UPDATED 31 MAR: Use fitToCoordinate instead to customize each edgePadding parameter
        mapRef.current?.fitToCoordinates([origin, {latitude, longitude}], {
          edgePadding: {top: 200, right: 20, bottom: 250, left: 20},
          animated: true,
        });
      }, 2000);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        // ADDED OR UPDATED 27 MAR: Conditionally add the thumbnail cropping style when in cameraView
        style={[styles.map, props.viewMode === 'cameraView' && styles.mapThumbnailCrop]}
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
        // showsCompass={true} // Show compass
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
            strokeColor={theme.lightColors!.primary}
            // UPDATED 07 MAR: Added props
            mode="DRIVING" // Allowed values are DRIVING, BICYCLING, WALKING, and TRANSIT
            resetOnChange={false} // Prevents polyline from blinking when updating
            splitWaypoints={true} // Split waypoints to multiple routes to prevent higher Google costs
            waypoints={routeWaypoints} // Add waypoints to the route
            // ADDED OR UPDATED 31 MAR: Store the distance and duration data
            onReady={result => {
              setDestinationMetrics({
                distance: result.distance, // in km
                duration: result.duration, // in minutes
              });
            }}
          />
        )}
        {/* ADDED OR UPDATED 28 MAR: Keep the chosen rest stop pinned separately */}
        {pinnedRestStop && (
          <Marker
            coordinate={{latitude: pinnedRestStop.latitude, longitude: pinnedRestStop.longitude}}
            title={pinnedRestStop.name}
            // image={require('@/assets/images/rest-stop-pin.png')}
            image={restStopIcon}
          />
        )}
        {destination && (
          // Display pin marker for destination
          <Marker
            coordinate={destination}
            title={getCommaTruncated(destinationLabel)}
            image={require('@/assets/images/destination-pin.png')}
          />
        )}
        {/* UPDATED 11 MAR: Render markers for ALL gas stations */}
        {restStops.map((station, index) => (
          <Marker
            key={`restStop-${index}`}
            coordinate={{latitude: station.latitude, longitude: station.longitude}}
            title={station.name}
            // image={require('@/assets/images/rest-stop-pin.png')}
            image={restStopIcon}
            // ADDED OR UPDATED 27 MAR: Show AddRestStoppanel on pin press
            onPress={() => handleRestStopPress(station)}
          />
        ))}
        {/* ADDED OR UPDATED 26 MAR: Show a polyline to each rest stop */}
        {restStops.length > 0 &&
          origin &&
          restStops.map((station, i) => (
            <MapViewDirections
              key={`stop-route-${i}`}
              origin={origin}
              destination={{latitude: station.latitude, longitude: station.longitude}}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={6}
              strokeColor={restStopRouteColor}
              mode="DRIVING"
              resetOnChange={false}
            />
          ))}
      </MapView>

      {/* ADDED OR UPDATED 27 MAR: Show AddRestStopPanel as portal */}
      {showAddRestStopPanel && (
        <AddRestStopPanel
          visible={showAddRestStopPanel}
          station={selectedRestStop}
          onConfirmYes={handleAddRestStopYes}
          onConfirmNo={handleAddRestStopNo}
        />
      )}

      {/* ADDED OR UPDATED 26 MAR: Enable rest stops button */}
      {/* ADDED OR UPDATED 02 APR: Wrap with animated for slide effect */}
      {showRestStopsButton && (
        <Animated.View
          style={[
            styles.nearbyStopsButtonContainer,
            {transform: [{translateY: resumeDrivingAnim}]},
          ]}>
          <TouchableOpacity style={styles.nearbyStopsButton} onPress={handleNearbyStops}>
            <Icon name="location-pin" type="material" size={20} />
            <Text style={styles.nearbyStopsButtonText}>Show Rest Stops</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ADDED OR UPDATED 16 MAR: Continue driving button */}
      {/* ADDED OR UPDATED 02 APR: Wrap with animated for slide effect */}
      {showContinueDriving && (
        <Animated.View
          style={[
            styles.continueDrivingButtonContainer,
            {transform: [{translateY: resumeDrivingAnim}]},
          ]}>
          <TouchableOpacity style={styles.continueDrivingButton} onPress={handleContinueDriving}>
            <Icon name="directions-car" type="material" size={20} />
            <Text style={styles.continueDrivingButtonText}>Resume Driving</Text>
          </TouchableOpacity>
        </Animated.View>
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
      {/* {showDestinationCard && (
        <View style={styles.destinationCard}>
          <Text style={styles.destinationCardText}>{destinationLabel}</Text>
          <TouchableOpacity style={styles.destinationCardClose} onPress={closeDestinationCard}>
            <Icon name="close-circle-outline" type="ionicon" />
          </TouchableOpacity>
        </View>
      )} */}

      {/* ADDED OR UPDATED 31: Improved destination card with photo, vicinity, distance, and duration */}
      {showDestinationCard && (
        <View style={styles.destinationCard}>
          <View style={styles.destinationContent}>
            {/* Left: show photo or placeholder */}
            {(() => {
              let photoUrl = '';
              if (destinationStation?.photos?.length) {
                const photoRef = destinationStation.photos[0].photo_reference;
                photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${GOOGLE_MAPS_APIKEY}`;
              }
              if (photoUrl) {
                return <Image source={{uri: photoUrl}} style={styles.destinationCardImage} />;
              } else {
                return (
                  <View style={[styles.destinationCardImage, styles.destinationCardPlaceholder]}>
                    <Text>No Image</Text>
                  </View>
                );
              }
            })()}

            {/* Right: show details */}
            <View style={styles.destinationDetails}>
              <View style={styles.destinationTitleRow}>
                <Text style={styles.destinationName}>
                  {destinationStation?.name ?? destinationLabel}
                </Text>
                <TouchableOpacity
                  style={styles.destinationCardClose}
                  onPress={closeDestinationCard}>
                  <Icon name="close-circle-outline" type="ionicon" />
                </TouchableOpacity>
              </View>

              {destinationStation?.vicinity && (
                <Text style={styles.destinationAddress}>{destinationStation.vicinity}</Text>
              )}

              {destinationMetrics &&
                (() => {
                  const totalMins = destinationMetrics.duration;
                  const hours = Math.floor(totalMins / 60);
                  const minutes = Math.round(totalMins % 60);

                  return (
                    <View style={styles.destinationMetricIcon}>
                      <Icon name="car-outline" type="material-community" size={18} />
                      <Text style={styles.destinationMetric}>
                        {' '}
                        {destinationMetrics.distance.toFixed(1)} km{' '}
                      </Text>
                      <Text style={styles.metricDivider}>{' | '}</Text>
                      <Icon
                        name="clock-outline"
                        type="material-community"
                        size={17}
                        style={styles.clockIcon}
                      />
                      <Text style={styles.destinationMetric}>
                        {hours > 0 ? `${hours} hr ` : ''}
                        {minutes} min
                      </Text>
                    </View>
                  );
                })()}
            </View>
          </View>
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

                        // ADDED OR UPDATED 31 MAR: Updated data to display
                        setDestinationStation({
                          name: data.result.name,
                          photos: data.result.photos,
                          vicinity: data.result.vicinity,
                        });

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
    backgroundColor: theme.lightColors!.primary,
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
    bottom: 108,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  // UPDATED 11 MAR: Nearby Stops button style
  nearbyStopsButton: {
    backgroundColor: theme.lightColors!.white,
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 16,
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
  nearbyStopsButtonText: {
    fontSize: 17,
    fontWeight: '400',
    paddingLeft: 6,
  },

  // ADDED OR UPDATED 31 MAR: New destination card styles
  destinationCard: {
    position: 'absolute',
    bottom: 96,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: -5},
    elevation: 20,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.lightColors!.grey3,
  },
  destinationCardIndicator: {
    width: 50,
    height: 4,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    borderRadius: 2,
    marginBottom: 10,
  },
  destinationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  destinationCardImage: {
    width: 140,
    height: 100,
    borderRadius: 10,
  },
  destinationCardPlaceholder: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationDetails: {
    display: 'flex',
    flex: 1,
    marginLeft: 16,
    justifyContent: 'flex-start',
  },
  destinationTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  destinationName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  destinationCardClose: {
    top: -8,
    right: -4,
    marginLeft: 5,
  },
  destinationAddress: {
    fontSize: 16,
    marginBottom: 6,
  },
  destinationMetric: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.lightColors!.primary,
  },
  metricDivider: {
    color: theme.lightColors!.grey3,
  },
  destinationMetricIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    marginRight: 3,
    top: 1,
  },

  // ADDED OR UPDATED 16 MAR: Continue driving button
  continueDrivingButtonContainer: {
    position: 'absolute',
    bottom: 108,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  continueDrivingButton: {
    backgroundColor: theme.lightColors!.white,
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 16,
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
    fontSize: 17,
    fontWeight: '400',
    paddingLeft: 6,
    marginHorizontal: 5,
  },
  // ADDED OR UPDATED 27 MAR: Override parent thumbnail scaling (miniWindowView scale of 0.25)
  mapThumbnailCrop: {
    transform: [{scale: 4}],
  },
});
