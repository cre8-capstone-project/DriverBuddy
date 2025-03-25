import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Dialog} from '@rneui/themed';
import FullWidthButton from '@/components/FullWidthButton';
import {Icon} from '@rneui/themed';

type Props = {
  dialogVisible: boolean;
  toggleDialog: () => void;
};

const VerificationErrorDialog = ({dialogVisible, toggleDialog}: Props) => {
  return (
    <Dialog
      isVisible={dialogVisible}
      onBackdropPress={toggleDialog}
      overlayStyle={styles.dialogContainer}>
      <View style={styles.container}>
        <Icon
          name="close-circle-outline"
          type="material-community"
          color="rgba(255, 75, 75, 1)"
          size={80}
        />
        <Text style={styles.title}>Your code is not correct</Text>
        <Text style={styles.description}>
          Sorry, the code you provided is not correct, please check and input another code to sign
          up.
        </Text>
        <FullWidthButton type="primary" title="Try Again" onPress={toggleDialog} />
      </View>
    </Dialog>
  );
};

export default VerificationErrorDialog;

const styles = StyleSheet.create({
  dialogContainer: {
    width: '90%',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignSelf: 'center',
  },
  container: {
    flexDirection: 'column',
    gap: 20,
    alignItems: 'center',
  },
  title: {
    fontWeight: '500',
    fontSize: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
  },
});
