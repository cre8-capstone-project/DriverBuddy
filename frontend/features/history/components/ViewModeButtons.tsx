import {View, Button, StyleSheet} from 'react-native';

type Props = {
  viewMode: string;
  setViewMode: (mode: string) => void;
};

export const ViewModeButtons = ({viewMode, setViewMode}: Props) => {
  return (
    <View style={styles.buttonContainer}>
      {['week', 'month', 'year'].map(mode => (
        <View style={styles.buttonWrapper} key={mode}>
          <Button
            title={mode.charAt(0).toUpperCase() + mode.slice(1)}
            color={viewMode === mode ? 'darkgreen' : 'green'}
            onPress={() => setViewMode(mode)}
          />
        </View>
      ))}
    </View>
  );
};

// Styles will be replaced after the visual design is ready
const styles = StyleSheet.create({
  buttonContainer: {flexDirection: 'row', gap: 2, width: '100%'},
  buttonWrapper: {flex: 1},
});
