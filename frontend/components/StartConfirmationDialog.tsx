import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Dialog} from '@rneui/themed';
import {useSnackBar} from './SnackBar';
import {useNavigation} from '@react-navigation/native';
import PairButtons from '@/components/PairButtons';

type Props = {
  dialogStatus: boolean;
  toggleDialog: () => void;
};

export const StartConfirmationDialog = ({dialogStatus, toggleDialog}: Props) => {
  const {showSnackBar} = useSnackBar();
  const navigation = useNavigation<any>();

  return (
    <Dialog
      isVisible={dialogStatus}
      onBackdropPress={toggleDialog}
      overlayStyle={styles.dialogContainer}>
      <View style={styles.container}>
        <Text style={styles.dialogTitle}>Start detection to prevent drowsiness?</Text>
        <Text>The camera will activate once you click the start button</Text>

        <PairButtons
          primaryTitle="Start now"
          secondaryTitle="Cancel"
          onPrimaryPress={() => {
            const FaceDetectionStatus = true;
            navigation.navigate('journey', {FaceDetectionStatus});
            toggleDialog();
            showSnackBar('The detection has started');
          }}
          onSecondaryPress={toggleDialog}
        />

        {/* <View>
          <Button
            title="Start now"
            type="solid"
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainer}
            onPress={() => {
              const FaceDetectionStatus = true;
              navigation.navigate('journey', {FaceDetectionStatus});
              toggleDialog();
              showSnackBar('The detection has started');
            }}
          />
          <Button
            title="Cancel"
            type="outline"
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainer}
            onPress={toggleDialog}
          />
        </View> */}
      </View>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  dialogContainer: {
    width: '90%',
    borderRadius: 20,
    paddingVertical: 48,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  container: {
    flexDirection: 'column',
    gap: 15,
  },
  dialogTitle: {fontWeight: 'bold', fontSize: 20, textAlign: 'center'},
  // buttonStyle: {},
  // buttonContainer: {width: '100%', justifyContent: 'center'},
});
