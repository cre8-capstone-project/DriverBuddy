import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Dialog} from '@rneui/themed';
import {useNavigation} from '@react-navigation/native';
import PairButtons from '@/components/PairButtons';

type Props = {
  dialogStatus: boolean;
  toggleDialog: () => void;
  setIsFaceDetectionActive: (active: boolean) => void;
  driveMode: boolean;
  setEndDrive: (endDrive: boolean) => void;
};

export const EndConfirmationDialog = ({
  dialogStatus,
  toggleDialog,
  setIsFaceDetectionActive,
  driveMode,
  setEndDrive,
}: Props) => {
  const navigation = useNavigation<any>();
  return (
    <Dialog
      isVisible={dialogStatus}
      onBackdropPress={toggleDialog}
      overlayStyle={styles.dialogContainer}>
      <View style={styles.container}>
        <Text style={styles.dialogTitle}>
          {driveMode
            ? 'Do you want to end the route?'
            : 'The detection will be turned off once you return to the homepage'}
        </Text>
        <View>
          <PairButtons
            primaryTitle={driveMode ? 'End' : 'Back to home'}
            secondaryTitle="Cancel"
            primaryColor={driveMode ? '#F44336' : undefined}
            onPrimaryPress={() => {
              setEndDrive(true);
              navigation.navigate('(tabs)');
              toggleDialog();
              setIsFaceDetectionActive(false);
            }}
            onSecondaryPress={toggleDialog}
          />

          {/* <Button
            title={driveMode ? 'End' : 'Back to home'}
            type="solid"
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainer}
            onPress={() => {
              setEndDrive(true);
              navigation.navigate('(tabs)');
              toggleDialog();
              setIsFaceDetectionActive(false);
            }}
          />
          <Button
            title="Cancel"
            type="outline"
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainer}
            onPress={toggleDialog}
          /> */}
        </View>
      </View>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  dialogContainer: {
    width: '90%',
    // width: 364,
    borderRadius: 20,
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  container: {
    flexDirection: 'column',
    gap: 15,
  },
  dialogTitle: {fontWeight: 'bold', fontSize: 20},
  // buttonStyle: {},
  // buttonContainer: {width: '100%', justifyContent: 'center'},
});
