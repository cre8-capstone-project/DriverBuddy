import React from 'react';
import {TouchableOpacity, StyleSheet, Text, Image} from 'react-native';
import {useTheme} from '@rneui/themed';

interface SearchHereToDriveProps {
  onPress: () => void;
  iconSource: any;
}

const SearchHereToDrive: React.FC<SearchHereToDriveProps> = ({onPress, iconSource}) => {
  const {theme} = useTheme();

  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Image source={iconSource} style={styles.icon} />
      <Text style={styles.text}>Search here to drive</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    width: 300,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 0,
  },
  text: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '500',
  },
});

export default SearchHereToDrive;
