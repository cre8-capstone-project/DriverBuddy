import React from 'react';
import {StyleSheet} from 'react-native';
import {ButtonGroup} from '@rneui/themed';
import {ViewMode} from '@/features/history/types/ViewMode';

type Props = {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  setStartDate: (date: Date) => void;
};

export const ViewModeButtons = ({viewMode, setViewMode, setStartDate}: Props) => {
  return (
    <ButtonGroup
      containerStyle={styles.container}
      buttonContainerStyle={styles.buttonContainer}
      selectedButtonStyle={styles.selectedButton}
      buttons={['Day', 'Week', 'Month', 'Year']}
      selectedIndex={['day', 'week', 'month', 'year'].indexOf(viewMode)}
      onPress={value => {
        if (value === 0) setViewMode('day');
        else if (value === 1) setViewMode('week');
        else if (value === 2) setViewMode('month');
        else if (value === 3) setViewMode('year');
        else {
          throw new Error('Invalid view mode');
        }

        // Reset the base date when view mode is changed
        setStartDate(new Date());
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {borderRadius: 18, padding: 0, margin: 0},
  buttonContainer: {borderColor: 'transparent', padding: 0, margin: 0},
  selectedButton: {
    // backgroundColor: '#00C9FF',
    margin: 7,
    borderRadius: 5,
    boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.2)',
  },
});
