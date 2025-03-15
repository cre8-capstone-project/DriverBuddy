import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Image, ImageSourcePropType} from 'react-native';
import {Button, Icon} from '@rneui/themed';
import {StartConfirmationDialog} from '@/features/safety-alert/components/StartConfirmationDialog';
import StartYourJourneyButton from '@/assets/images/StartYourJourneyButton.png';
import OnboardingTour from '@/components/OnboardingTour';
import {useOnboardingTourContext} from '@/contexts/OnboardingTourProvider';

export default function HomeScreen() {
  const [dialogStatus, setDialogStatus] = useState(false);
  const {showOnboarding, setShowOnboarding} = useOnboardingTourContext();

  const toggleStartDialog = () => {
    setDialogStatus(!dialogStatus);
  };

  return (
    <>
      {showOnboarding && <OnboardingTour onComplete={() => setShowOnboarding(false)} />}
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
    </>
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
