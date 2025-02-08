import {ButtonGroup} from '@rneui/themed';

type Props = {
  viewMode: string;
  setViewMode: (mode: string) => void;
};

export const ViewModeButtons = ({viewMode, setViewMode}: Props) => {
  return (
    <ButtonGroup
      buttons={['Week', 'Month', 'Year']}
      selectedIndex={['week', 'month', 'year'].indexOf(viewMode)}
      onPress={value => {
        if (value >= 0 && value <= 2) {
          setViewMode(value === 0 ? 'week' : value === 1 ? 'month' : 'year');
        }
      }}
      containerStyle={{margin: 0, padding: 0}}
    />
  );
};
