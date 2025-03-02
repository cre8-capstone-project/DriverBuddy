import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Button, Dialog} from '@rneui/themed';

type Props = {
  dialogStatus: boolean;
  toggleDialog: () => void;
  setIsFaceDetectionActive: (active: boolean) => void;
  setViewMode: (mode: 'cameraView' | 'mapView') => void;
};

export const EndConfirmationDialog = ({
  dialogStatus,
  toggleDialog,
  setIsFaceDetectionActive,
  setViewMode,
}: Props) => {
  return (
    <Dialog isVisible={dialogStatus} onBackdropPress={toggleDialog}>
      <View style={styles.dialogContent}>
        <Text style={styles.dialogText}>
          The detection will be turn off once you return to the homepage
        </Text>
        <Button
          title="Back to home"
          type="solid"
          containerStyle={styles.dialogButtonContainer}
          buttonStyle={styles.dialogButton}
          onPress={() => {
            setIsFaceDetectionActive(false);
            setViewMode('cameraView');
            toggleDialog();
          }}
        />
        <Button
          title="Cancel"
          type="outline"
          containerStyle={styles.dialogButtonContainer}
          buttonStyle={styles.dialogButton}
          onPress={toggleDialog}
        />
      </View>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  dialogContent: {
    gap: 20,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dialogText: {
    fontSize: 16,
  },
  dialogButtonContainer: {
    borderRadius: 20,
  },
  dialogButton: {
    borderRadius: 20,
  },
});
