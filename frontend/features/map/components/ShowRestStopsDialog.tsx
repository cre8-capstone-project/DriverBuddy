import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated, Easing} from 'react-native';
import {Dialog, Button} from '@rneui/themed';
import theme from '@/components/Theme';

// Define props to match those passed from map.tsx
type ShowRestStopsDialogProps = {
  isVisible: boolean;
  onConfirmYes: () => void;
  onConfirmNo: (confirmed: boolean) => void;
  autoCloseDelay?: number;
};

// Default auto-close time for modal in milliseconds
const AUTO_CLOSE_DELAY = 15000;

export const ShowRestStopsDialog = ({
  isVisible,
  onConfirmYes,
  onConfirmNo,
  autoCloseDelay = AUTO_CLOSE_DELAY,
}: ShowRestStopsDialogProps) => {
  // Animated line timer
  const progressAnim = useRef(new Animated.Value(0)).current;

  // ADDED OR UPDATED 16 MAR: Flag to prevent calling onConfirmNo twice
  const hasResponded = useRef(false);

  // ADDED OR UPDATED 16 MAR: Start the auto-close timer only when isVisible or autoCloseDelay changes, and reset the response flag
  useEffect(() => {
    if (isVisible) {
      hasResponded.current = false; // Reset response flag when modal becomes visible
      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: autoCloseDelay,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(() => {
        if (!hasResponded.current) {
          console.log('Modal has auto closed'); // Log auto-close message
          onConfirmNo(true);
          hasResponded.current = true;
        }
      });
    }
  }, [isVisible, autoCloseDelay]);

  const lineWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    // ADDED OR UPDATED 16 MAR: Removed onBackdropPress prop to avoid double dismissal when clicking buttons
    <Dialog isVisible={isVisible} overlayStyle={styles.dialogContainer}>
      <View style={styles.container}>
        <View style={{width: '100%', height: 4, backgroundColor: '#ddd', overflow: 'hidden'}}>
          <Animated.View
            style={{
              width: lineWidth,
              height: '100%',
              backgroundColor: theme.lightColors.primary,
            }}
          />
        </View>
        <Text style={styles.dialogTitle}>See available rest stops?</Text>
        <Button
          title="Yes"
          onPress={() => {
            if (!hasResponded.current) {
              hasResponded.current = true;
              onConfirmYes();
            }
          }}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainer}
        />
        <Button
          title="No"
          type="outline"
          onPress={() => {
            if (!hasResponded.current) {
              hasResponded.current = true;
              onConfirmNo(false);
            }
          }}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainer}
        />
      </View>
    </Dialog>
  );
};

// Dialog styles
const styles = StyleSheet.create({
  dialogContainer: {
    width: '90%',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  container: {
    flexDirection: 'column',
    gap: 15,
  },
  dialogTitle: {fontWeight: 'bold', fontSize: 20},
  buttonStyle: {},
  buttonContainer: {width: '100%', justifyContent: 'center'},
});
