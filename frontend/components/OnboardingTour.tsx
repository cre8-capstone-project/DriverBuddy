import React, {useState} from 'react';
import {View, Text, StyleSheet, Modal, Dimensions} from 'react-native';
import {Button} from '@rneui/themed';
import {BlurView} from 'expo-blur';

const {width, height} = Dimensions.get('window');

const steps = [
  {
    title: 'Drowsiness Detection',
    text: 'Activate the DriveBuddy drowsiness detection by tapping the Start Detection button. Make sure to have detection on before you start your trip!',
    position: {top: 100, left: 20},
  },
  {
    title: 'Drowsiness Detection',
    text: 'You’ll know if the detection is on when this indicator is present. DriveBuddy will alert you when it notices signs of drowsiness.',
    position: {top: 200, left: 50},
  },
  {
    title: 'Map',
    text: 'Start your trip navigation just the way  you’re used to with Google Maps.',
    position: {top: 300, left: 30},
  },
  {
    title: 'Driving History',
    text: 'Check out the drowsiness detection analytics in your Driving History, which is in Settings. .',
    position: {top: 400, left: 60},
  },
  {
    title: `You're All Set!`,
    text: 'That’s the gist of it! Ready to take DriveBuddy drowsiness detection on a test drive?',
    position: {top: 500, left: 40},
  },
];
type OnboardingProps = {
  onComplete: () => void;
};
const OnboardingTour: React.FC<OnboardingProps> = ({onComplete}) => {
  const [step, setStep] = useState(0);

  return (
    <Modal transparent visible>
      <BlurView intensity={50} style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              /*top: steps[step].top, left: steps[step].left*/
            },
          ]}>
          {/* Caret (Triangle Pointer) */}
          <View style={styles.caret} />
          <View style={styles.content}>
            <View>
              <Text style={styles.title}>{steps[step].title}</Text>
            </View>
            <View>
              <Text style={styles.text}>{steps[step].text}</Text>
            </View>
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
                  <Text style={styles.buttonText}>Back</Text>
                </Button>
              )}
            </View>
          </View>
        </View>
      </BlurView>
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
    width: width * 0.7,
    alignItems: 'center',
  },
  caret: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    marginBottom: -5,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 36,
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
    marginTop: 10,
  },
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
