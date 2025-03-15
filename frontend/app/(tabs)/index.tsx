import React, {useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Image, ImageSourcePropType} from 'react-native';
import {Button, Icon} from '@rneui/themed';
import {StartConfirmationDialog} from '@/features/safety-alert/components/StartConfirmationDialog';
import StartYourJourneyButton from '@/assets/images/StartYourJourneyButton.png';

export default function HomeScreen() {
  const [dialogStatus, setDialogStatus] = useState(false);

  const toggleStartDialog = () => {
    setDialogStatus(!dialogStatus);
  };

  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity onPress={toggleStartDialog} style={styles.button}>
          <Image source={StartYourJourneyButton as ImageSourcePropType} style={styles.image} />
        </TouchableOpacity>
        <StartConfirmationDialog dialogStatus={dialogStatus} toggleDialog={toggleStartDialog} />
        {/* <Button
          buttonStyle={styles.roundButton}
          containerStyle={styles.roundButton}
          onPress={() => {
            toggleStartDialog();
          }}>
          <Icon name={'videocam'} color={'white'} size={50} />
          <Text style={styles.buttonText}>Start your{'\n'}journey</Text>
        </Button> */}
      </View>
      <StartConfirmationDialog dialogStatus={dialogStatus} toggleDialog={toggleStartDialog} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
