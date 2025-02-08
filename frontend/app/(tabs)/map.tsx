import React, { useRef } from 'react';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet, View, Button } from 'react-native';

export default function App() {
  const mapRef = useRef<MapView>(null);

  return (
    <View style={mapStyles.container}>
      <MapView
        ref={mapRef}
        style={mapStyles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 49.2827, // Default to Vancouver
          longitude: -123.1207,
          latitudeDelta: 2, // Smaller = zoomed in
          longitudeDelta: 2,
        }}
      />
      <View style={mapStyles.buttonContainer}>
        <Button
          title="Button Test"
          onPress={() => {
            console.log('Button pressed');
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
