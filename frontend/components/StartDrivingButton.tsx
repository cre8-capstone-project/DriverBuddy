import React, {useState} from 'react';
import {TouchableOpacity, StyleSheet, Text} from 'react-native';
import {useTheme, Icon} from '@rneui/themed';
import {LinearGradient} from 'expo-linear-gradient';

interface StartDrivingButtonProps {
  onPress?: () => void;
  disabled?: boolean;
}

const StartDrivingButton: React.FC<StartDrivingButtonProps> = ({onPress, disabled}) => {
  const {theme} = useTheme();
  const [gradientColors, setGradientColors] = useState([
    'rgba(0, 255, 255, 1)',
    'rgba(30, 58, 138, 1)',
  ]);

  const handlePress = () => {
    setGradientColors(['rgba(30, 58, 138, 1)', 'rgba(0, 255, 255, 1)']);
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={styles.buttonContainer}
      activeOpacity={1}>
      <LinearGradient
        colors={gradientColors}
        style={[
          styles.button,
          {
            opacity: disabled ? 0.5 : 1,
            borderWidth: 0,
          },
        ]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <Icon
          name="directions-car"
          type="material"
          color={theme.colors.white}
          size={40}
          style={styles.icon}
        />
        <Text style={[styles.text, {color: theme.colors.white}]}>Start driving</Text>
      </LinearGradient>
    </TouchableOpacity>
    // <TouchableOpacity
    //   onPress={onPress}
    //   disabled={disabled}
    //   style={[
    //     styles.button,
    //     {
    //       backgroundColor: disabled ? theme.colors.grey3 : theme.colors.primary,
    //       borderColor: disabled ? theme.colors.grey4 : theme.colors.primary,
    //       borderWidth: 0,
    //     },
    //   ]}>
    //   <Icon
    //     name="directions-car"
    //     type="material"
    //     color={disabled ? theme.colors.grey5 : theme.colors.white} // ✅ 無効時はグレー
    //     size={40}
    //     style={styles.icon}
    //   />
    //   <Text style={[styles.text, {color: disabled ? theme.colors.grey5 : theme.colors.white}]}>
    //     Start driving
    //   </Text>
    // </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    width: 200,
    height: 64,
    borderRadius: 44,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 44,
    borderWidth: 2,
    paddingHorizontal: 24,
    paddingVertical: 12,
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
