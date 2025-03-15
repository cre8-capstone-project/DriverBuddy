import React from 'react';
import {StyleSheet} from 'react-native';
import {ButtonGroup} from '@rneui/themed';
import type {DisplayModeType} from '@/features/history/types/DisplayModeType';

type Props = {
  displayMode: DisplayModeType;
  setDisplayMode: (mode: DisplayModeType) => void;
  setStartDate: (date: Date) => void;
};

export const ViewModeButtons = ({displayMode, setDisplayMode, setStartDate}: Props) => {
  return (
    <ButtonGroup
      containerStyle={styles.container}
      buttonContainerStyle={styles.buttonContainer}
      buttonStyle={styles.button}
      selectedButtonStyle={styles.selectedButton}
      selectedTextStyle={styles.selectedButtonText}
      textStyle={styles.buttonText}
      buttons={['Day', 'Week', 'Month', 'Year']}
      selectedIndex={['day', 'week', 'month', 'year'].indexOf(displayMode)}
      onPress={value => {
        if (value === 0) setDisplayMode('day');
        else if (value === 1) setDisplayMode('week');
        else if (value === 2) setDisplayMode('month');
        else if (value === 3) setDisplayMode('year');
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
  container: {width: 292, height: 42, borderRadius: 36, padding: 0, margin: 0, alignSelf: 'center'},
  buttonContainer: {borderColor: 'transparent', padding: 0, margin: 0, backgroundColor: '#1E3A8A'},
  selectedButton: {
    backgroundColor: 'white',
    margin: 8,
    borderRadius: 8,
    boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.2)',
    color: 'black',
  },
  selectedButtonText: {color: 'black'},
  buttonText: {color: 'white', fontSize: 15},
});
