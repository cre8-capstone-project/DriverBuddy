import React, {useState} from 'react';
import {View, StyleSheet, Text, TouchableOpacity, ImageBackground} from 'react-native';
import {Icon} from '@rneui/themed';
import {StartConfirmationDialog} from '@/components/StartConfirmationDialog';
import OnboardingTour from '@/components/OnboardingTour';
import {useOnboardingTourContext} from '@/contexts/OnboardingTourProvider';
import {LinearGradient} from 'expo-linear-gradient';
import HomeBackground from '@/assets/images/HomeBackground.png';

export default function HomeScreen() {
  const [dialogStatus, setDialogStatus] = useState(false);
  const {showOnboarding, setShowOnboarding} = useOnboardingTourContext();

  const toggleStartDialog = () => {
    setDialogStatus(!dialogStatus);
  };

  return (
    <>
      {showOnboarding && <OnboardingTour onComplete={() => setShowOnboarding(false)} />}
      {/* <View style={styles.container} > */}
      <ImageBackground source={HomeBackground} resizeMode="cover" style={styles.container}>
        <View style={styles.overlay} />
        <View>
          <TouchableOpacity onPress={toggleStartDialog}>
            <View style={styles.ringL}>
              <View style={styles.ringS}>
                <LinearGradient
                  colors={['rgba(0, 255, 255, 1)', 'rgba(20, 121, 175, 1)', 'rgba(30, 58, 138, 1)']}
                  style={styles.roundButton}
                  start={{x: 0, y: 1}}
                  end={{x: 1.2, y: 0}}>
                  <Icon name={'videocam'} color={'white'} size={40} />
                  <Text style={styles.buttonText}>Start your{'\n'}journey</Text>
                </LinearGradient>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <StartConfirmationDialog dialogStatus={dialogStatus} toggleDialog={toggleStartDialog} />
      {/* </View> */}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'blue',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(14, 34, 90, 0.542)',
  },
  roundButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 500,
    textAlign: 'center',
    marginBottom: 10,
  },
  ringL: {
    width: 174,
    height: 174,
    borderRadius: 87,
    borderColor: 'rgba(20, 121, 175, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  ringS: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderColor: 'rgba(20, 121, 175, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
});
