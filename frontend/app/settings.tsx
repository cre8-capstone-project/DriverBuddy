import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {Icon, Button, Header} from '@rneui/themed';
import {useRouter} from 'expo-router';
import StopTester from '@/components/StopTester';
import {updateMapSettings} from '@/features/map/constants/settings'; // Cocoy's Update: Import updateMapSettings function
import theme from '@/components/Theme'; // Cocoy's Update: Import theme
import FullWidthButton from '@/components/FullWidthButton';

export default function SettingsScreen() {
  const router = useRouter();

  // Cocoy's Update:
  // State for settings
  // const [restStopTypes, setRestStopTypes] = useState<string[]>(['gas_station']);
  const [restStopTypes, setRestStopTypes] = useState<string>('gas_station'); // ADDED OR UPDATED 20 MAR: Select only 1 rest stop type (api limitation)
  const [restStopCounts, setRestStopCounts] = useState<number>(3);
  const [alertMsgAndSounds, setAlertMsgAndSounds] = useState<string>('standard');

  // Rest stop types
  const toggleRestStopType = (type: string) => {
    // if (restStopTypes.includes(type)) {
    //   setRestStopTypes(restStopTypes.filter(t => t !== type));
    // } else {
    //   setRestStopTypes([...restStopTypes, type]);
    // }
    setRestStopTypes(type); // ADDED OR UPDATED 20 MAR: Select only 1 rest stop type (api limitation)
  };

  // Increment and decrement buttons
  const decrementCount = () => {
    setRestStopCounts(prev => Math.max(1, prev - 1));
  };
  const incrementCount = () => {
    setRestStopCounts(prev => Math.min(10, prev + 1));
  };

  // Save and Cancel
  const handleSave = () => {
    // Build comma separated string from the selected types
    // const typesString = restStopTypes.join(',');
    const typesString = restStopTypes; // ADDED OR UPDATED 20 MAR: Select only 1 rest stop type (api limitation)
    updateMapSettings(typesString, restStopCounts, alertMsgAndSounds);
    router.push('/profile'); // Navigate back to profile
  };

  const handleCancel = () => {
    // router.push('/profile'); // Discard changes and navigate back to profile
    router.back();
  };

  return (
    <>
      <View style={styles.customHeader}>
        <Pressable style={styles.backArea} onPress={handleCancel}>
          <Icon name="arrow-back" size={32} color="#000" />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </View>

      <View style={styles.container}>
        {/* Cocoy's Update: New settings page */}
        <Text style={styles.sectionHeading}>Type of Rest Stops</Text>
        <View style={styles.toggleButtonContainer}>
          <Button
            title="Gas Stations"
            // type={restStopTypes.includes('gas_station') ? 'solid' : 'outline'}
            type={restStopTypes === 'gas_station' ? 'solid' : 'outline'} // ADDED OR UPDATED 20 MAR: Select only 1 rest stop type (api limitation)
            buttonStyle={styles.toggleButtons}
            onPress={() => toggleRestStopType('gas_station')}
          />
          <Button
            title="Hotels"
            // type={restStopTypes.includes('lodging') ? 'solid' : 'outline'}
            type={restStopTypes === 'lodging' ? 'solid' : 'outline'} // ADDED OR UPDATED 20 MAR: Select only 1 rest stop type (api limitation)
            buttonStyle={styles.toggleButtons}
            onPress={() => toggleRestStopType('lodging')}
          />
          <Button
            title="Convenience Stores"
            // type={restStopTypes.includes('convenience_store') ? 'solid' : 'outline'}
            type={restStopTypes === 'convenience_store' ? 'solid' : 'outline'} // ADDED OR UPDATED 20 MAR: Select only 1 rest stop type (api limitation)
            buttonStyle={styles.toggleButtons}
            onPress={() => toggleRestStopType('convenience_store')}
          />
        </View>

        <Text style={styles.sectionHeading}>Number of Rest Stops</Text>
        <View style={styles.counterContainer}>
          <Button title="-" onPress={decrementCount} />
          <Text style={styles.countText}>{restStopCounts}</Text>
          <Button title="+" onPress={incrementCount} />
        </View>

        {/* <Text style={styles.sectionHeading}>Alert Message & Sound</Text>
      <View style={styles.toggleButtonContainer}>
        <Button
          title="Standard"
          type={alertMsgAndSounds === 'standard' ? 'solid' : 'outline'}
          onPress={() => setAlertMsgAndSounds('standard')}
        />
        <Button
          title="Comical"
          type={alertMsgAndSounds === 'comical' ? 'solid' : 'outline'}
          onPress={() => setAlertMsgAndSounds('comical')}
        />
      </View> */}

        <View style={styles.buttonRow}>
          <FullWidthButton title="Save" type="primary" onPress={handleSave} />
          <FullWidthButton title="Cancel" type="secondary" onPress={handleCancel} />
        </View>

        {/* <Button
        buttonStyle={styles.menuButton}
        containerStyle={styles.menuButtonContainer}
        onPress={() => router.push('/history')}>
        <Icon name="history" style={styles.icon} />
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuText}>Driving History</Text>
          <Text style={styles.menuSubText}>See how long you've driven</Text>
        </View>
        <Icon name="chevron-right" style={styles.icon} />
      </Button>

      <Button
        buttonStyle={styles.menuButton}
        containerStyle={styles.menuButtonContainer}
        onPress={() => router.push('/')}
        disabled>
        <Icon name="watch" style={styles.icon} />
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuText}>Connect Smartwatch</Text>
          <Text style={styles.menuSubText}>For better detection & reminders</Text>
        </View>
        <Icon name="chevron-right" style={styles.icon} />
      </Button>
      <StopTester /> */}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: 20,
    gap: 20,
  },
  menuButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    margin: 0,
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#1E3A8A',
  },
  menuTextContainer: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 10,
  },
  menuText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  menuSubText: {
    fontSize: 14,
    color: 'white',
  },
  icon: {
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 5,
  },

  // Cocoy's Update: New styles for the settings page TODO
  sectionHeading: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  toggleButtonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 10,
  },
  toggleButtons: {
    width: 240,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  countText: {
    fontSize: 18,
    marginHorizontal: 20,
  },
  buttonRow: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    gap: 20,
  },
  saveButton: {
    paddingHorizontal: 20,
  },
  cancelButton: {
    paddingHorizontal: 20,
  },
  customHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.lightColors!.white,
    zIndex: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    paddingHorizontal: 8,
    position: 'relative',
  },
  backArea: {
    paddingHorizontal: 4,
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
});
