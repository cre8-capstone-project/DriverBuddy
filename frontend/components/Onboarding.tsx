import {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ImageSourcePropType,
  ImageBackground,
} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {useRouter} from 'expo-router';
import StepsIndicator from './StepsIndicator';
import FullWidthButton from '@/components/FullWidthButton';
import Welcome1 from '@/assets/images/Welcome1.png';
import Welcome2 from '@/assets/images/Welcome2.png';
import LogoHorizontal from '@/assets/images/drivebuddy-logo-name-horizontal.png';
import {useTheme} from '@rneui/themed';
import DriveBuddyLogoGif from '@/assets/images/drivebuddy-logo-animation.gif';

import {LinearGradient} from 'expo-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';

interface OnboardingProps {
  callback?: (state: boolean) => void;
}

const {width, height} = Dimensions.get('window');

const Onboarding: React.FC<OnboardingProps> = ({callback}) => {
  const [onboardingStep, setOnboardingStep] = useState(1);
  const router = useRouter();
  const {theme} = useTheme();

  const handleNext = () => {
    if (onboardingStep < 3) {
      setOnboardingStep(onboardingStep + 1);
    }
  };

  const handleBack = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  const handleCreateAccount = () => {
    router.replace('/signUp');
  };

  const handleSignIn = () => {
    if (callback) {
      callback(false);
    }
  };

  const renderStep = () => {
    switch (onboardingStep) {
      case 1:
        return (
          <Animated.View
            entering={FadeIn.duration(500)}
            exiting={FadeOut.duration(300)}
            style={styles.slide}
            key="slide1">
            <ImageBackground
              source={Welcome1 as ImageSourcePropType}
              style={styles.backgroundImage}
              imageStyle={{top: 30}}
              resizeMode="cover">
              <View style={styles.overlay}>
                <Image
                  source={LogoHorizontal as ImageSourcePropType}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.title}>
                  Detect signs{'\n'}of drowsiness{'\n'}by face monitoring
                </Text>
              </View>
            </ImageBackground>
          </Animated.View>
        );
      case 2:
        return (
          <Animated.View
            entering={FadeIn.duration(500)}
            exiting={FadeOut.duration(300)}
            style={styles.slide}
            key="slide2">
            <ImageBackground
              source={Welcome2 as ImageSourcePropType}
              style={styles.backgroundImage}
              imageStyle={{top: 30}}
              resizeMode="cover">
              <View style={styles.overlay}>
                <Image
                  source={LogoHorizontal as ImageSourcePropType}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.title}>GPS Navigator and Rest Stop Suggestion</Text>
              </View>
            </ImageBackground>
          </Animated.View>
        );
      case 3:
        return (
          <Animated.View
            entering={FadeIn.duration(500)}
            exiting={FadeOut.duration(300)}
            style={styles.finalSlide}
            key="slide3">
            <LinearGradient
              colors={['#A9FFFF', '#fbfbfb', '#fbfbfb', '#ffffff']}
              style={StyleSheet.absoluteFill}>
              <StatusBar translucent backgroundColor="#A9FFFF" style="dark" />
              <SafeAreaView
                style={{flex: 1, backgroundColor: 'transparent'}}
                edges={['top', 'bottom', 'left', 'right']}>
                <View style={styles.finalSlideContainer}>
                  <View style={styles.logoContainer}>
                    <Image
                      source={DriveBuddyLogoGif as ImageSourcePropType}
                      style={styles.finalLogo}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.finalText}>Drive aware, get there!</Text>
                  <View style={styles.buttonContainer}>
                    <FullWidthButton
                      title="Create an Account"
                      type="primary"
                      onPress={handleCreateAccount}
                    />
                    <View style={{flexDirection: 'row', marginTop: 20, justifyContent: 'center'}}>
                      <Text>Already have an account? </Text>
                      <TouchableOpacity onPress={handleSignIn}>
                        <Text style={{color: theme.colors.primary, fontWeight: 'bold'}}>
                          Sign In
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </SafeAreaView>
            </LinearGradient>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderStep()}
      <StepsIndicator stepsNumber={3} currentStep={onboardingStep} />
      {onboardingStep < 3 && (
        <View style={styles.navigationContainer}>
          <FullWidthButton title="Next" type="primary" onPress={handleNext} />
          <FullWidthButton title="Skip" type="tertiary" onPress={() => setOnboardingStep(3)} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    // paddingHorizontal: 30,
  },
  finalSlide: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: '#fff',
  },
  finalSlideContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    marginBottom: 40,
  },
  title: {
    fontFamily: 'Figtree-Bold',
    fontSize: 36,
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  logoContainer: {
    width: width / 2, // 1/2.5 of the screen width
    aspectRatio: 1, // Maintain aspect ratio
    marginBottom: 20,
    // marginTop: 20,
  },
  finalLogo: {
    width: '100%',
    height: '100%',
    // marginBottom: 20,
  },
  finalText: {
    fontFamily: 'Figtree-Bold',
    fontSize: 45,
    textAlign: 'center',
    marginBottom: 50,
    color: '#333',
    marginHorizontal: 40,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  navigationContainer: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    gap: 8,
    marginBottom: 10,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  overlay: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: 'flex-start',
  },
  logo: {
    width: 190,
    height: 36,
    marginBottom: 10,
  },
});

export default Onboarding;
