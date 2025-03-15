// import React from 'react';
// import {StyleSheet, View} from 'react-native';
// import {Button, useTheme} from '@rneui/themed';

// interface PairButtonsProps {
//   primaryTitle: string;
//   primaryOnPress: () => void;
//   secondaryTitle: string;
//   secondaryOnPress: () => void;
// }

// const PairButtons: React.FC<PairButtonsProps> = ({
//   primaryTitle,
//   primaryOnPress,
//   secondaryTitle,
//   secondaryOnPress,
// }) => {
//   const {theme} = useTheme();

//   return (
//     <View style={styles.container}>
//       <Button
//         title={primaryTitle}
//         type="solid"
//         buttonStyle={[styles.button, {backgroundColor: theme.colors.primary}]}
//         containerStyle={styles.buttonContainer}
//         titleStyle={styles.buttonText}
//         onPress={primaryOnPress}
//       />
//       <Button
//         title={secondaryTitle}
//         type="outline"
//         buttonStyle={[styles.button, {borderColor: theme.colors.primary}]}
//         containerStyle={styles.buttonContainer}
//         titleStyle={[styles.buttonText, {color: theme.colors.primary}]}
//         onPress={secondaryOnPress}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     width: '100%',
//     flexDirection: 'column',
//     marginTop: 20,
//     gap: 10,
//   },
//   buttonContainer: {
//     width: '100%',
//   },
//   button: {
//     width: 332,
//     height: 46,
//     borderRadius: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   buttonText: {
//     fontSize: 15,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
// });

// export default PairButtons;

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
        containerStyle={[styles.primaryButtonShadow, {borderWidth: 0}]}
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
        containerStyle={{borderWidth: 0}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    marginTop: 20,
    gap: 10,
  },
  primaryButton: {
    width: 332,
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
    elevation: 5,
  },
  secondaryButton: {
    width: 332,
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
