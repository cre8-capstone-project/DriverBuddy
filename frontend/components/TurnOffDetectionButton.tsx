import React from 'react';
import {TouchableOpacity, StyleSheet, Text, View} from 'react-native';
import {Icon, useTheme} from '@rneui/themed';

interface TurnOffDetectionButtonProps {
  onPress?: () => void;
  disabled?: boolean;
}

const TurnOffDetectionButton: React.FC<TurnOffDetectionButtonProps> = ({onPress, disabled}) => {
  const {theme} = useTheme();

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={styles.container}>
      <View
        style={[
          styles.button,
          {
            backgroundColor: disabled ? theme.colors.grey3 : theme.colors.grey5,
            borderColor: disabled ? theme.colors.grey3 : theme.colors.grey0,
            borderWidth: 2,
          },
        ]}>
        <Icon
          name="videocam-off"
          type="material"
          color={disabled ? theme.colors.grey3 : theme.colors.grey0}
          size={40}
          style={styles.icon}
        />
        <Text style={[styles.text, {color: disabled ? theme.colors.grey3 : theme.colors.grey0}]}>
          Turn Off{'\n'}Detection
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 5,
  },
  button: {
    // flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
    height: 64,
    borderRadius: 44,
    paddingHorizontal: 11,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default TurnOffDetectionButton;
