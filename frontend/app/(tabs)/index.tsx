import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Image, ImageSourcePropType} from 'react-native';
import {Button, Icon} from '@rneui/themed';
import {StartConfirmationDialog} from '@/components/StartConfirmationDialog';
import StartYourJourneyButton from '@/assets/images/StartYourJourneyButton.png';
import OnboardingTour from '@/components/OnboardingTour';
import {useOnboardingTourContext} from '@/contexts/OnboardingTourProvider';
import {LinearGradient} from 'expo-linear-gradient';

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
          <TouchableOpacity onPress={toggleStartDialog}>
            <View style={styles.ringL}>
              <View style={styles.ringS}>
                <LinearGradient
                  colors={['rgba(0, 255, 255, 1)', 'rgba(20, 121, 175, 1)', 'rgba(30, 58, 138, 1)']}
                  style={styles.roundButton}
                  start={{x: 0, y: 1}}
                  end={{x: 1.2, y: 0}}>
                  <Icon name={'videocam'} color={'white'} size={50} />
                  <Text style={styles.buttonText}>Start your{'\n'}journey</Text>
                </LinearGradient>
              </View>
            </View>
          </TouchableOpacity>
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
    fontSize: 28,
    color: 'white',
    fontWeight: 500,
    textAlign: 'center',
    marginBottom: 10,
  },
  ringL: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderColor: 'rgba(20, 121, 175, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
  },
  ringS: {
    width: 210,
    height: 210,
    borderRadius: 105,
    borderColor: '#3956a7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
});
