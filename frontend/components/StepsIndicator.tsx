import {View, StyleSheet} from 'react-native';
import theme from './Theme';

interface StepsIndicatorProps {
  stepsNumber: number;
  currentStep: number;
}
const StepsIndicator: React.FC<StepsIndicatorProps> = ({stepsNumber = 1, currentStep = 1}) => {
  return (
    <View style={styles.dotsContainer}>
      {Array.from(Array(stepsNumber).keys()).map(step => (
        <View key={step} style={[styles.dot, currentStep - 1 === step ? styles.activeDot : null]} />
      ))}
    </View>
  );
};
const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 15,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.lightColors?.primary,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: theme.lightColors?.primary,
    width: 25,
  },
});
export default StepsIndicator;
