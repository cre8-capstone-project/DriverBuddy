import React, {useState} from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useTheme} from '@rneui/themed';

interface FullWidthButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
}

const FullWidthButton: React.FC<FullWidthButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  disabled = false,
}) => {
  const {theme} = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const getButtonStyles = () => {
    switch (type) {
      case 'primary':
        return [
          styles.button,
          {
            backgroundColor: isPressed ? theme.colors.primary : theme.colors.primary,
            shadowColor: isPressed ? theme.colors.primary : 'transparent',
            elevation: isPressed ? 6 : 0,
          },
        ];
      case 'secondary':
        return [
          styles.button,
          {
            backgroundColor: isPressed ? theme.colors.secondary : theme.colors.white,
            borderColor: theme.colors.grey3,
            borderWidth: 1,
            shadowColor: isPressed ? theme.colors.primary : 'transparent',
            elevation: isPressed ? 6 : 0,
          },
        ];
      case 'tertiary':
        return styles.button;
      default:
        return styles.button;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[getButtonStyles(), disabled && {backgroundColor: theme.colors.grey3}]}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}>
      <Text
        style={[
          styles.text,
          type === 'secondary' && {color: theme.colors.primary},
          type === 'tertiary' && {
            color: theme.colors.primary,
            textDecorationLine: isPressed ? 'underline' : 'none',
          },
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    // maxWidth: 398,
    // width: 398,
    height: 46,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default FullWidthButton;
