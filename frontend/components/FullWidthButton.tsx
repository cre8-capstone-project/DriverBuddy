import React, {useState} from 'react';
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native';
import {useTheme} from '@rneui/themed';
import {Feather} from '@expo/vector-icons';

interface FullWidthButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  icon?: {
    name: string;
    size?: number;
    color?: string;
  };
}

const FullWidthButton: React.FC<FullWidthButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  disabled = false,
  icon,
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

  const getTextStyles = () => {
    const baseStyles = [styles.text];

    if (type === 'secondary') {
      baseStyles.push({color: theme.colors.primary});
    }

    if (type === 'tertiary') {
      baseStyles.push({
        color: theme.colors.primary,
        textDecorationLine: isPressed ? 'underline' : 'none',
      });
    }

    return baseStyles;
  };

  const getIconColor = () => {
    if (disabled) return theme.colors.grey4;

    if (type === 'primary') return 'white';
    if (type === 'secondary') return theme.colors.primary;
    if (type === 'tertiary') return theme.colors.primary;

    return 'white';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[getButtonStyles(), disabled && {backgroundColor: theme.colors.grey3}]}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}>
      <View style={styles.contentContainer}>
        {icon && (
          <Feather
            name={icon.name}
            size={icon.size || 20}
            color={icon.color || getIconColor()}
            style={[styles.icon]}
          />
        )}
        <Text style={getTextStyles()}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 46,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },
  icon: {
    marginRight: 10,
  },
});

export default FullWidthButton;
