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
import LogoVertical from '@/assets/images/drivebuddy-logo-name.png';
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
              colors={['#f1f6fa', '#ffffff', '#ffffff']}
              style={StyleSheet.absoluteFill}>
              <StatusBar translucent backgroundColor="#f1f6fa" style="dark" />
              <SafeAreaView
                style={{flex: 1, backgroundColor: 'transparent'}}
                edges={['top', 'bottom', 'left', 'right']}>
                <View style={styles.finalSlideContainer}>
                  <Image
                    source={LogoVertical as ImageSourcePropType}
                    style={styles.finalLogo}
                    resizeMode="contain"
                  />

                  <Text style={styles.finalText}>Drive aware, get there!</Text>
                  <View style={styles.buttonContainer}>
                    <FullWidthButton
                      title="Create Account"
                      type="primary"
                      onPress={handleCreateAccount}
                    />
                    <View style={{flexDirection: 'row', marginTop: 20, justifyContent: 'center'}}>
                      <Text>Already have an account? </Text>
                      <TouchableOpacity onPress={handleSignIn}>
                        <Text style={{color: 'blue', fontWeight: 'bold'}}>Log In</Text>
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

  return onboardingStep === 3 ? (
    <LinearGradient colors={['#f1f6fa', '#ffffff']} style={styles.container}>
      {renderStep()}
      <StepsIndicator stepsNumber={3} currentStep={onboardingStep} />
    </LinearGradient>
  ) : (
    <View style={styles.container}>
      {renderStep()}
      <StepsIndicator stepsNumber={3} currentStep={onboardingStep} />
      <View style={styles.navigationContainer}>
        <FullWidthButton title="Next" type="primary" onPress={handleNext} />
        <FullWidthButton title="Skip" type="tertiary" onPress={() => setOnboardingStep(3)} />
      </View>
    </View>
  );

  // return (
  //   <View style={styles.container}>
  //     {renderStep()}

  //     <StepsIndicator stepsNumber={3} currentStep={onboardingStep} />

  //     {/* Navigation buttons */}
  //     {onboardingStep < 3 ? (
  //       <View style={styles.navigationContainer}>
  //         <FullWidthButton title="Next" type="primary" onPress={handleNext} />
  //         <FullWidthButton title="Skip" type="tertiary" onPress={() => setOnboardingStep(3)} />
  //       </View>
  //     ) : null}
  //   </View>
  // );
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
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
  finalLogo: {
    width: '100%',
    marginBottom: 20,
  },
  finalText: {
    fontSize: 64,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50,
    color: '#333',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: '#4A80F0',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4A80F0',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4A80F0',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#4A80F0',
    fontSize: 16,
    fontWeight: '600',
  },
  navigationContainer: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
  },
  skipButton: {
    padding: 10,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
  },
  navButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  navButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
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
    marginTop: 30,
    alignItems: 'flex-start',
  },
  logo: {
    width: 190,
    height: 36,
    marginBottom: 10,
  },
});

export default Onboarding;
