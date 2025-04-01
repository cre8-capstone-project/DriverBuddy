import React from 'react';
import {TouchableOpacity, StyleSheet, Text, View} from 'react-native';
import {Icon, useTheme} from '@rneui/themed';
import {LinearGradient} from 'expo-linear-gradient';

interface TurnOnDetectionButtonProps {
  onPress?: () => void;
  disabled?: boolean;
}

const TurnOnDetectionButton: React.FC<TurnOnDetectionButtonProps> = ({onPress, disabled}) => {
  const {theme} = useTheme();

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={styles.container}>
      {disabled ? (
        <View style={[styles.button, {backgroundColor: theme.colors.grey3}]}>
          <Icon name="videocam" type="material" color="white" size={40} style={styles.icon} />
          <Text style={styles.text}>Turn On{'\n'}detection</Text>
        </View>
      ) : (
        <LinearGradient
          colors={['rgba(0, 255, 255, 1)', 'rgba(30, 58, 138, 1)']}
          start={{x: 0, y: 2}}
          end={{x: 1, y: -1}}
          style={styles.button}>
          <Icon name="videocam" type="material" color="white" size={40} style={styles.icon} />
          <Text style={styles.text}>Turn On{'\n'}detection</Text>
        </LinearGradient>
      )}
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
    paddingHorizontal: 11,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // elevation: 3,
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
