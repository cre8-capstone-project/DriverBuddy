import React, {useState} from 'react';
import {TouchableOpacity, Text, StyleSheet, View, Platform} from 'react-native';
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

  const getContainerStyle = () => {
    const baseStyle: any = [styles.buttonWrapper];

    let shadowColor = '#000'; // default shadow

    if (isPressed) {
      shadowColor = theme.colors.primary;
    }

    const isPrimaryWithShadow = type === 'primary' && !disabled;
    const isSecondaryWithShadow = type === 'secondary' && isPressed;

    if (isPrimaryWithShadow || isSecondaryWithShadow) {
      baseStyle.push({
        backgroundColor: type === 'primary' ? theme.colors.primary : theme.colors.white,
        ...Platform.select({
          android: {
            elevation: 3,
          },
          ios: {
            shadowColor: shadowColor,
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.3,
            shadowRadius: 6,
          },
        }),
      });
    } else {
      baseStyle.push({
        backgroundColor: type === 'primary' ? theme.colors.primary : theme.colors.white,
        elevation: 0,
        shadowOpacity: 0,
      });
    }

    if (type === 'secondary') {
      baseStyle.push({
        borderColor: theme.colors.grey3,
        borderWidth: 1,
      });
    }

    if (disabled) {
      baseStyle.push({backgroundColor: theme.colors.grey3});
    }

    return baseStyle;
  };

  const getTextStyles = () => {
    const baseStyles = [styles.text];
    if (type === 'secondary' || type === 'tertiary') {
      baseStyles.push({color: theme.colors.primary});
    }
    return baseStyles;
  };

  const getIconColor = () => {
    if (disabled) return theme.colors.grey4;
    if (type === 'primary') return 'white';
    return theme.colors.primary;
  };

  return (
    <View style={getContainerStyle()}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={styles.touchable}>
        <View style={styles.contentContainer}>
          {icon && (
            <Feather
              name={icon.name}
              size={icon.size || 20}
              color={icon.color || getIconColor()}
              style={styles.icon}
            />
          )}
          <Text style={getTextStyles()}>{title}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    width: '100%',
    borderRadius: 9999,
  },
  touchable: {
    height: 46,
    borderRadius: 50,
    // paddingVertical: 12,
    // paddingHorizontal: 16,
    // borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
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
