import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ImageBackground,
  ImageSourcePropType,
} from 'react-native';
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
      <View style={styles.imageContainer}>
        <ImageBackground
          source={HomeBackground as ImageSourcePropType}
          resizeMode="cover"
          style={styles.backgroundImage}>
          <View style={styles.overlay} />
        </ImageBackground>
      </View>
      <View style={styles.contentContainer}>
        <TouchableOpacity onPress={toggleStartDialog}>
          <View style={styles.ringL}>
            <View style={styles.ringS}>
              <LinearGradient
                colors={['rgba(0, 255, 255, 1)', 'rgba(20, 121, 175, 1)', 'rgba(30, 58, 138, 1)']}
                style={styles.roundButton}
                start={{x: 0, y: 1}}
                end={{x: 1.2, y: 0}}>
                <Icon name={'videocam'} color={'white'} size={40} />
                <Text style={styles.buttonText}>Start{'\n'}Driving</Text>
              </LinearGradient>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <StartConfirmationDialog dialogStatus={dialogStatus} toggleDialog={toggleStartDialog} />
    </>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginLeft: -30,
    marginTop: -50,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 8, 44, 0.574)',
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
