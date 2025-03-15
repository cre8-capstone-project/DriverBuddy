import React from 'react';
import {TouchableOpacity, StyleSheet, Text} from 'react-native';
import {useTheme} from '@rneui/themed';

interface EndRouteButtonProps {
  onPress?: () => void;
  disabled?: boolean;
}

const EndRouteButton: React.FC<EndRouteButtonProps> = ({onPress, disabled}) => {
  const {theme} = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? theme.colors.grey3 : theme.colors.error,
          borderColor: disabled ? theme.colors.grey4 : theme.colors.error,
        },
        styles.container,
      ]}>
      <Text style={[styles.text, disabled && {color: theme.colors.grey5}]}>End Route</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 5,
  },
  button: {
    width: 180,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 44,
    borderWidth: 2,
    paddingHorizontal: 11,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  text: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
});

export default EndRouteButton;
