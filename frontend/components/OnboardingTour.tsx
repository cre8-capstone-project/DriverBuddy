import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
  Image,
  ImageSourcePropType,
  Platform,
} from 'react-native';
import {Button} from '@rneui/themed';
import {BlurView} from 'expo-blur';
import StartDetectionButton from '@/assets/images/StartDetectionButton.png';

const {width, height} = Dimensions.get('window');

const steps = [
  {
    title: 'Drowsiness Detection',
    text: [
      'Activate the DriveBuddy drowsiness detection by tapping the Start Detection button.',
      'Make sure to have detection on before you start your trip!',
    ],
    image: StartDetectionButton,
    position: {top: 25},
  },
  {
    title: 'Drowsiness Detection',
    text: [
      'You’ll know if the detection is on when this indicator is present.',
      'DriveBuddy will alert you when it notices signs of drowsiness.',
    ],
    position: {top: 50},
    caretTop: {
      borderLeftWidth: 20,
      borderRightWidth: 20,
      borderBottomWidth: 20,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: 'white',
      marginBottom: -5,
    },
  },
  {
    title: 'Map',
    text: ['Start your trip navigation just the way  you’re used to with Google Maps.'],
    position: {top: height / 5},
  },
  {
    title: 'Driving History',
    text: [
      'Check out the drowsiness detection analytics in your Driving History, which is in Settings.',
    ],
    position: {top: height / 3.5},
    caretBottom: {
      borderLeftWidth: 20,
      borderRightWidth: 20,
      borderTopWidth: 20,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: 'white',
      marginBottom: height / 4 - 5,
    },
  },
  {
    title: `You're All Set!`,
    text: [
      'That’s the gist of it!',
      ' Ready to take DriveBuddy drowsiness detection on a test drive?',
    ],
    position: {top: height / 5},
  },
];
type OnboardingProps = {
  onComplete: () => void;
};
const OnboardingTour: React.FC<OnboardingProps> = ({onComplete}) => {
  const [step, setStep] = useState(0);
  const canUseBlurView = Platform.OS === 'ios';

  return (
    <Modal transparent visible>
      {canUseBlurView ? (
        // iOS can use BlurView effectively
        <BlurView tint="dark" intensity={90} style={StyleSheet.absoluteFill} />
      ) : (
        // On Android, use a semi-transparent background instead
        <View style={[StyleSheet.absoluteFill, {backgroundColor: 'rgba(0, 0, 0, 0.75)'}]} />
      )}
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, {top: steps[step].position.top}]}>
          {/* Caret (Triangle Pointer) */}
          <View style={[styles.caret, steps[step].caretTop ? steps[step].caretTop : {}]} />
          <View style={styles.content}>
            <View style={styles.closeButtonContainer}>
              <Button
                onPress={onComplete}
                style={styles.closeButton}
                title={step === steps.length - 1 ? 'Close' : 'Skip'}
              />
            </View>
            <View>
              <Text style={styles.title}>{steps[step].title}</Text>
            </View>
            {steps[step].text.map((text, index) => (
              <View key={index}>
                <Text style={styles.text}>{text}</Text>
              </View>
            ))}

            {steps[step].image ? (
              <View style={styles.indicatorContainer}>
                <Image source={steps[step].image as ImageSourcePropType} />
              </View>
            ) : (
              ''
            )}

            {/* Step Indicators */}
            <View style={styles.indicatorContainer}>
              {steps.map((_, i) => (
                <View key={i} style={[styles.indicator, step === i && styles.activeIndicator]} />
              ))}
            </View>

            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                onPress={() => (step === steps.length - 1 ? onComplete() : setStep(step + 1))}
                style={styles.button}>
                <Text style={styles.buttonText}>
                  {step === steps.length - 1 ? 'Get Started' : 'Next'}
                </Text>
              </Button>
              {step > 0 && (
                <Button onPress={() => setStep(step - 1)} style={styles.button}>
                  <Text style={styles.buttonText}>Go Back</Text>
                </Button>
              )}
            </View>
          </View>
          <View style={[styles.caret, steps[step].caretBottom ? steps[step].caretBottom : {}]} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    position: 'absolute',
    width: width * 0.9,
    alignItems: 'center',
  },
  caret: {
    width: 0,
    height: 0,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    paddingTop: 0,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'left',
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#007AFF',
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginTop: 10,
    width: '100%',
  },
  closeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    textAlign: 'right',
    width: '100%',
  },
  closeButton: {},
  button: {
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    marginHorizontal: 5,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default OnboardingTour;
