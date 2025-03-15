import React from 'react';
import {TouchableOpacity, StyleSheet, Text, View} from 'react-native';
import {Icon, useTheme} from '@rneui/themed';

interface TurnOnDetectionButtonProps {
  onPress?: () => void;
  disabled?: boolean;
}

const TurnOnDetectionButton: React.FC<TurnOnDetectionButtonProps> = ({onPress, disabled}) => {
  const {theme} = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? theme.colors.grey3 : theme.colors.primary,
          borderWidth: 0,
        },
        styles.container,
      ]}>
      <Icon name="videocam" type="material" color="white" size={40} style={styles.icon} />
      <View>
        <Text style={styles.text}>Turn On{'\n'}detection</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 5,
  },
  button: {
    width: 180,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 44,
    // borderWidth: 2,
    paddingHorizontal: 11,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3, // Android の影
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    color: 'white',
  },
});

export default TurnOnDetectionButton;
