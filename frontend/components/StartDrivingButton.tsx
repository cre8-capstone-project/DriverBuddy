import React from 'react';
import {TouchableOpacity, StyleSheet, Text} from 'react-native';
import {useTheme, Icon} from '@rneui/themed';

interface StartDrivingButtonProps {
  onPress?: () => void;
  disabled?: boolean;
}

const StartDrivingButton: React.FC<StartDrivingButtonProps> = ({onPress, disabled}) => {
  const {theme} = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? theme.colors.grey3 : theme.colors.primary,
          borderColor: disabled ? theme.colors.grey4 : theme.colors.primary,
          borderWidth: 0,
        },
      ]}>
      <Icon
        name="directions-car"
        type="material"
        color={disabled ? theme.colors.grey5 : theme.colors.white} // ✅ 無効時はグレー
        size={40}
        style={styles.icon}
      />
      <Text style={[styles.text, {color: disabled ? theme.colors.grey5 : theme.colors.white}]}>
        Start driving
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 44,
    borderWidth: 2,
    paddingHorizontal: 24,
    paddingVertical: 11,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StartDrivingButton;
