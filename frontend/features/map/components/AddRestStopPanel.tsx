import React, {useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, Image, Animated, PanResponder, Dimensions} from 'react-native';
import {Button} from '@rneui/themed';

// Define props for the panel
interface AddRestStopPanelProps {
  visible: boolean;
  // Display rest stop details
  station: {
    name: string;
    photos?: {photo_reference: string}[];
    vicinity?: string;
  } | null;
  onConfirmYes?: () => void;
  onConfirmNo?: () => void;
}

const AddRestStopPanel: React.FC<AddRestStopPanelProps> = props => {
  const {visible, station, onConfirmYes, onConfirmNo} = props;
  const screenWidth = Dimensions.get('window').width;
  const minPanelHeight = 160;

  // State to hold the actual panel height when it is rendered
  const [panelHeight, setPanelHeight] = useState(minPanelHeight);

  // Animated value for sliding panel
  const translateY = useRef(new Animated.Value(minPanelHeight)).current;

  // Using PanResponder to drag panel downward to dismiss it
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        // Only allow dragging downward
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > panelHeight / 4) {
          // If dragged more than 1/4 panel height, dismiss panel
          Animated.timing(translateY, {
            toValue: panelHeight,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            if (onConfirmNo) {
              onConfirmNo();
            }
          });
        } else {
          // If dragged less that 25%, slide back up
          Animated.timing(translateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  // Animate panel in/out
  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: panelHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, panelHeight, translateY]);

  // Build photo URL using first photo reference
  const GOOGLE_MAPS_APIKEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_APIKEY ?? '';
  let photoUrl = '';
  if (station && station.photos && station.photos.length > 0) {
    const photoRef = station.photos[0].photo_reference;
    photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${GOOGLE_MAPS_APIKEY}`;
  }

  return (
    <Animated.View
      style={[
        styles.panel,
        {
          transform: [{translateY}],
          minHeight: minPanelHeight,
          width: screenWidth,
        },
      ]}
      {...panResponder.panHandlers}
      // Update panelHeight based on amount of details
      onLayout={event => {
        const {height} = event.nativeEvent.layout;
        if (height > minPanelHeight) {
          setPanelHeight(height);
        } else {
          setPanelHeight(minPanelHeight);
        }
      }}>
      {/* Draggable indicator line */}
      <View style={styles.indicator} />

      <View style={styles.content}>
        {/* Left: show photo or placeholder */}
        {photoUrl ? (
          <Image source={{uri: photoUrl}} style={styles.restStopImage} />
        ) : (
          <View style={[styles.restStopImage, styles.placeholder]}>
            <Text>No Image</Text>
          </View>
        )}

        {/* Right: show title and buttons */}
        <View style={styles.details}>
          <Text style={styles.restStopName}>{station ? station.name : 'Rest Stop Name'}</Text>
          <Text style={styles.restStopAddress}>
            {station ? station.vicinity : 'Rest Stop Address'}
          </Text>
          <View style={styles.buttonRow}>
            {/* <Button
              title="Add Rest Stop"
              containerStyle={styles.addRestStopButtonContainer}
              buttonStyle={styles.addRestStopButton}
              titleStyle={styles.addRestStopButtonTitle}
              onPress={() => {
                // Call parent callback for adding rest stop
                if (onConfirmYes) {
                  onConfirmYes();
                }
              }}
            /> */}
            {/* <Button
              title="Cancel"
              type="outline"
              onPress={() => {
                // Dismiss panel
                if (onConfirmNo) {
                  onConfirmNo();
                }
              }}
              containerStyle={styles.cancelButtonContainer}
            /> */}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default AddRestStopPanel;

// Panel styles
const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    bottom: 0,
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
    paddingTop: 10,
  },
  indicator: {
    width: 50,
    height: 4,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 20,
  },
  restStopImage: {
    width: 160,
    height: 120,
    borderRadius: 10,
  },
  placeholder: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'flex-start',
  },
  restStopName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  restStopAddress: {
    fontSize: 16,
    marginBottom: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButtonContainer: {
    marginLeft: 10,
  },
  addRestStopButtonContainer: {
    flex: 1,
  },
  addRestStopButton: {
    padding: 5,
  },
  addRestStopButtonTitle: {
    fontSize: 16,
  },
});
