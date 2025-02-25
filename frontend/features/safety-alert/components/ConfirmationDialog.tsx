import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Button, Dialog} from '@rneui/themed';
import {useSnackBar} from './SnackBar';

type Props = {
  dialogStatus: boolean;
  toggleDialog: () => void;
  setIsFaceDetectionActive: (active: boolean) => void;
};

export const ConfirmationDialog = ({
  dialogStatus,
  toggleDialog,
  setIsFaceDetectionActive,
}: Props) => {
  const {showSnackBar} = useSnackBar();

  return (
    <Dialog isVisible={dialogStatus} onBackdropPress={toggleDialog}>
      <View style={styles.dialogContent}>
        <Text style={styles.dialogText}>Ready to start detection?</Text>
        <Button
          title="Start now"
          type="solid"
          buttonStyle={styles.dialogButton}
          onPress={() => {
            setIsFaceDetectionActive(true);
            showSnackBar('The detection has started');
            toggleDialog();
          }}
        />
        <Button
          title="Cancel"
          type="outline"
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
  dialogText: {
    fontSize: 16,
  },
  dialogButton: {
    borderRadius: 20,
  },
});
