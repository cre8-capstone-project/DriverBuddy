import {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {useRouter} from 'expo-router';
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
    if (callback) {
      callback(false);
    }
  };

  const handleSignIn = () => {
    router.push('/signUp');
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
            <Image source={'' as ImageSourcePropType} style={styles.image} resizeMode="contain" />
            <Text style={styles.title}>Welcome to Our App</Text>
            <Text style={styles.subtitle}>
              Discover amazing features that will change your life
            </Text>
          </Animated.View>
        );
      case 2:
        return (
          <Animated.View
            entering={FadeIn.duration(500)}
            exiting={FadeOut.duration(300)}
            style={styles.slide}
            key="slide2">
            <Image source={'' as ImageSourcePropType} style={styles.image} resizeMode="contain" />
            <Text style={styles.title}>Powerful and Easy</Text>
            <Text style={styles.subtitle}>
              Simple to use yet powerful enough for all your needs
            </Text>
          </Animated.View>
        );
      case 3:
        return (
          <Animated.View
            entering={FadeIn.duration(500)}
            exiting={FadeOut.duration(300)}
            style={styles.finalSlide}
            key="slide3">
            <Text style={styles.finalText}>Ready to get started?</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleCreateAccount}>
                <Text style={styles.primaryButtonText}>Create Account</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleSignIn}>
                <Text style={styles.secondaryButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderStep()}

      {/* Dots indicator */}
      <View style={styles.dotsContainer}>
        {[1, 2, 3].map(step => (
          <View
            key={step}
            style={[styles.dot, onboardingStep === step ? styles.activeDot : null]}
          />
        ))}
      </View>

      {/* Navigation buttons */}
      {onboardingStep < 3 ? (
        <View style={styles.navigationContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={() => setOnboardingStep(3)}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          {onboardingStep > 1 && (
            <TouchableOpacity style={styles.navButton} onPress={handleBack}>
              <Text style={styles.navButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.navButton} onPress={handleNext}>
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      ) : null}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  finalSlide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  finalText: {
    fontSize: 28,
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
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#4A80F0',
    width: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});

export default Onboarding;
