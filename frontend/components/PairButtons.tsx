import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Button} from '@rneui/themed';
import {useTheme} from '@rneui/themed';

interface PairButtonsProps {
  primaryTitle: string;
  secondaryTitle: string;
  onPrimaryPress: () => void;
  onSecondaryPress: () => void;
  primaryColor?: string;
}

const PairButtons: React.FC<PairButtonsProps> = ({
  primaryTitle,
  secondaryTitle,
  onPrimaryPress,
  onSecondaryPress,
  primaryColor,
}) => {
  const {theme} = useTheme();

  return (
    <View style={styles.container}>
      {/* Primary Button */}
      <Button
        title={primaryTitle}
        buttonStyle={[
          styles.primaryButton,
          {backgroundColor: primaryColor || theme.colors.primary},
        ]}
        titleStyle={styles.buttonTextPrimary}
        onPress={onPrimaryPress}
        containerStyle={[styles.primaryButtonShadow, {borderWidth: 0}, {width: '100%'}]}
      />

      {/* Secondary (Outline) Button */}
      <Button
        title={secondaryTitle}
        type="outline"
        buttonStyle={[
          styles.secondaryButton,
          {
            borderColor: theme.colors.grey3,
            borderWidth: 1,
          },
        ]}
        titleStyle={[styles.buttonTextSecondary, {color: theme.colors.primary}]}
        onPress={onSecondaryPress}
        containerStyle={[{borderWidth: 0}, {width: '100%'}]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'column',
    marginTop: 20,
    gap: 10,
  },
  primaryButton: {
    width: '100%',
    height: 46,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonShadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  secondaryButton: {
    width: '100%',
    // width: 332,
    height: 46,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextPrimary: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PairButtons;
