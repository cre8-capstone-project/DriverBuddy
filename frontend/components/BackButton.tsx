import React from 'react';
import {TouchableOpacity, StyleSheet, Text} from 'react-native';
import {Icon} from '@rneui/themed';
import {useTheme} from '@rneui/themed';

interface BackButtonProps {
  onPress?: () => void;
  disabled?: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({onPress, disabled = false}) => {
  const {theme} = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {backgroundColor: theme.colors?.white},
        disabled && {backgroundColor: theme.colors?.grey5, elevation: 0},
      ]}>
      <Icon
        name="west"
        type="material"
        color={disabled ? theme.colors?.grey3 : 'black'}
        size={32}
      />
      <Text style={[styles.text, disabled && {color: theme.colors?.grey3}]}>Back</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // Shadow effect
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  icon: {
    color: 'black',
  },
  text: {
    fontSize: 15,
    textAlign: 'center',
    color: 'black',
    fontFamily: 'Urbanist, Arial, sans-serif',
    fontWeight: '500',
    marginTop: -3,
  },
});

export default BackButton;
