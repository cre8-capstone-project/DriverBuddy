import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Dialog, Button} from '@rneui/themed';
import {useNavigation} from '@react-navigation/native';

type Props = {
  dialogStatus: boolean;
  toggleDialog: () => void;
  onConfirmEndRoute: () => void; // Callback to trigger Map reset
};

export const EndRouteDialog = ({dialogStatus, toggleDialog, onConfirmEndRoute}: Props) => {
  const navigation = useNavigation<any>();
  return (
    <Dialog isVisible={dialogStatus} onBackdropPress={toggleDialog}>
      <View style={styles.container}>
        <Text style={styles.dialogTitle}>Do you want to end the route?</Text>
        <View>
          <Button
            title="End"
            type="solid"
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainer}
            onPress={() => {
              onConfirmEndRoute(); // Trigger the map reset callback
              navigation.navigate('(tabs)');
              toggleDialog();
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
