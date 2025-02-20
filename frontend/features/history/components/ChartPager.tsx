import {View, Text, StyleSheet} from 'react-native';
import {Icon} from '@rneui/base';

type Props = {
  viewMode: string;
  startDate: Date;
  setStartDate: (updateFunc: (prevDate: Date) => Date) => void;
};

export const ChartPager = ({viewMode, startDate, setStartDate}: Props) => {
  const handlePrev = () => {
    setStartDate(prevDate => {
      const newDate = new Date(prevDate);
      if (viewMode === 'day') {
        newDate.setDate(newDate.getDate() - 1);
      } else if (viewMode === 'week') {
        newDate.setDate(newDate.getDate() - 7);
      } else if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (viewMode === 'year') {
        newDate.setFullYear(newDate.getFullYear() - 1);
      }
      return newDate;
    });
  };

  const handleNext = () => {
    setStartDate(prevDate => {
      const newDate = new Date(prevDate);
      if (viewMode === 'day') {
        newDate.setDate(newDate.getDate() + 1);
      } else if (viewMode === 'week') {
        newDate.setDate(newDate.getDate() + 7);
      } else if (viewMode === 'month') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (viewMode === 'year') {
        newDate.setFullYear(newDate.getFullYear() + 1);
      }
      return newDate;
    });
  };

  const getFormattedDate = () => {
    const date = new Date(startDate);
    const options: Intl.DateTimeFormatOptions = {year: 'numeric', month: 'short', day: 'numeric'};

    if (viewMode === 'week') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('en-US', options)} - ${endOfWeek.toLocaleDateString('en-US', options)}`;
    } else if (viewMode === 'month') {
      return date.toLocaleString('en-US', {month: 'long', year: 'numeric'});
    } else if (viewMode === 'year') {
      return date.getFullYear().toString();
    }
    return startDate.toLocaleDateString('en-US', options);
  };

  return (
    <View style={styles.pager}>
      <Icon name="chevron-left" onPress={handlePrev} />
      <Text>{getFormattedDate()}</Text>
      <Icon name="chevron-right" onPress={handleNext} />
    </View>
  );
};

// Styles will be replaced after the visual design is ready
const styles = StyleSheet.create({
  pager: {
    flexDirection: 'row',
    gap: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
