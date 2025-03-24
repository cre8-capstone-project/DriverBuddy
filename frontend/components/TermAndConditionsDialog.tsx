import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {Dialog} from '@rneui/themed';
import FullWidthButton from '@/components/FullWidthButton';
import termsAndConditionsText from '@/assets/text/termsAndConditionsText';

type Props = {
  dialogVisible: boolean;
  toggleDialog: () => void;
};

const TermAndConditionsDialog = ({dialogVisible, toggleDialog}: Props) => {
  return (
    <Dialog
      isVisible={dialogVisible}
      onBackdropPress={toggleDialog}
      overlayStyle={styles.dialogContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Terms & Conditions</Text>

        <ScrollView style={styles.scroll}>
          <Text style={styles.content}>{termsAndConditionsText}</Text>
        </ScrollView>
        <FullWidthButton type="primary" title="Done" onPress={toggleDialog} />

        {/* <TouchableOpacity style={styles.doneButton} onPress={toggleDialog}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity> */}
      </View>
    </Dialog>
  );
};

export default TermAndConditionsDialog;

const styles = StyleSheet.create({
  dialogContainer: {
    width: '90%',
    borderRadius: 20,
    padding: 16,
    alignSelf: 'center',
  },
  container: {
    flexDirection: 'column',
    gap: 15,
    // maxHeight: '80%',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  scroll: {
    flexGrow: 0,
    maxHeight: 350,
    color: '#1E3A8A',
  },
  content: {
    fontSize: 13,
    lineHeight: 20,
  },
  doneButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  doneText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
