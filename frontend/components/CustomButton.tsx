import React from 'react';
import {Button, useTheme} from '@rneui/themed';
import {View, ViewStyle, TextStyle} from 'react-native';

type ButtonType =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'icon'
  | 'back'
  | 'search'
  | 'detection'
  | 'navigation'
  | 'profile'
  | 'onboarding';

interface CustomButtonProps {
  title: string;
  type?: ButtonType;
  onPress?: () => void;
  disabled?: boolean;
  icon?: {name: string; color?: string; size?: number};
}

const CustomButton: React.FC<CustomButtonProps> = ({title, type = 'primary', icon, ...props}) => {
  const {theme} = useTheme();

  const styles: Record<ButtonType, {buttonStyle: ViewStyle; titleStyle: TextStyle}> = {
    back: {
      buttonStyle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 4,
      },
      titleStyle: {
        color: theme.colors.black,
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 16,
        textAlign: 'center',
        marginTop: 2,
      },
    },
    search: {
      buttonStyle: {
        flex: 1,
        backgroundColor: theme.colors.white,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      titleStyle: {
        color: theme.colors.black,
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
      },
    },
  };

  return (
    <Button
      title={title}
      icon={icon}
      buttonStyle={[styles[type].buttonStyle]}
      titleStyle={[styles[type].titleStyle]}
      {...props}
    />
  );
};

export default CustomButton;
