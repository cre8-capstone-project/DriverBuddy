import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Dialog, Button} from '@rneui/themed';
import {useNavigation} from '@react-navigation/native';

type Props = {
  dialogStatus: boolean;
  toggleDialog: () => void;
  setIsFaceDetectionActive: (active: boolean) => void;
};

export const EndConfirmationDialog = ({
  dialogStatus,
  toggleDialog,
  setIsFaceDetectionActive,
}: Props) => {
  const navigation = useNavigation<any>();
  return (
    <Dialog isVisible={dialogStatus} onBackdropPress={toggleDialog}>
      <View style={styles.container}>
        <Text style={styles.dialogTitle}>
          The detection will be turn off once you return to the homepage
        </Text>
        <View>
          <Button
            title="Back to home"
            type="solid"
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainer}
            onPress={() => {
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
          />
        </View>
      </View>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 15,
  },
  dialogTitle: {fontWeight: 'bold', fontSize: 20},
  buttonStyle: {},
  buttonContainer: {width: '100%', justifyContent: 'center'},
});
