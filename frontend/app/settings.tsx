import React, {useEffect, useState} from 'react';
import {View, Text, Alert, ScrollView, StyleSheet, Pressable} from 'react-native';
import {
  getSettings,
  upsertSettings,
  addRestStopType,
  deleteRestStopType,
} from '@/services/SettingsService';
import {Icon, Button} from '@rneui/themed';
import theme from '@/components/Theme';
import FullWidthButton from '@/components/FullWidthButton';
import {useRouter} from 'expo-router';
import {updateMapSettings} from '@/features/map/constants/settings';

const restStopOptions = [
  {id: 1, label: 'Gas Stations'},
  {id: 2, label: 'Hotels'},
  {id: 3, label: 'Convenience Stores'},
];

const alertSoundOptions = [
  {id: 1, label: 'Standard'},
  {id: 2, label: 'Comical'},
];

const SettingsScreen = () => {
  const router = useRouter();
  const [settings, setSettings] = useState({
    restStopTypes: [1],
    restStopCount: 3,
    restStopRadius: 5,
    alertMsgAndSound: 1,
  });

  const [initialSettings, setInitialSettings] = useState(settings);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const data = await getSettings();
    if (data) {
      setSettings(data);
      setInitialSettings(data);
    }
  };

  const toggleRestStopType = (typeId: number) => {
    // setSettings(prev => {
    //   const updatedTypes = prev.restStopTypes.includes(typeId)
    //     ? prev.restStopTypes.filter(id => id !== typeId)
    //     : [...prev.restStopTypes, typeId];
    //   return {...prev, restStopTypes: updatedTypes};
    // });
    setSettings(prev => ({...prev, restStopTypes: [typeId]})); // Allow only 1 type to be selected
  };

  const changeRestStopCount = (change: number) => {
    setSettings(prev => {
      const newCount = Math.min(10, Math.max(1, prev.restStopCount + change));
      return {...prev, restStopCount: newCount};
    });
  };

  const selectAlertSound = (id: number) => {
    setSettings(prev => ({...prev, alertMsgAndSound: id}));
  };

  const handleSave = async () => {
    try {
      await upsertSettings({
        restStopCount: settings.restStopCount,
        restStopRadius: settings.restStopRadius,
        alertMsgAndSound: settings.alertMsgAndSound,
      });

      // Update rest stop types
      const currentRestStops = await getSettings();
      const currentTypes = currentRestStops?.restStopTypes || [];

      const toAdd = settings.restStopTypes.filter(id => !currentTypes.includes(id));
      const toDelete = currentTypes.filter(id => !settings.restStopTypes.includes(id));

      await Promise.all(toAdd.map(id => addRestStopType(currentRestStops?.id!, id)));
      // await Promise.all(toDelete.map(id => deleteRestStopType(id)));
      await Promise.all(toDelete.map(id => deleteRestStopType(currentRestStops?.id!, id)));

      // ADDED OR UPDATED 21 MAR: Update module settings so map.tsx gets the new values.
      const newPersistedSettings = await getSettings();
      if (
        newPersistedSettings &&
        newPersistedSettings.restStopTypes &&
        newPersistedSettings.restStopTypes.length > 0
      ) {
        updateMapSettings(
          newPersistedSettings.restStopTypes[0].toString(),
          newPersistedSettings.restStopCount,
          newPersistedSettings.alertMsgAndSound.toString()
        );
      }

      Alert.alert('Success', 'Settings updated successfully');
      setInitialSettings(settings);
    } catch (error) {
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const handleCancel = () => {
    setSettings(initialSettings);
  };
  const handleBack = () => {
    // router.push('/profile'); // Discard changes and navigate back to profile
    router.back();
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  return (
    <ScrollView contentContainerStyle={{flexGrow: 1}}>
      <View style={styles.customHeader}>
        <Pressable style={styles.backRow} onPress={handleBack}>
          <Icon name="arrow-back" size={32} color="#000" />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </View>
      <View style={styles.container}>
        {/* Section 1: Type of Rest Stops */}
        <Text style={styles.sectionHeading}>Which Rest Stops to Suggest?</Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10,
            flexWrap: 'wrap',
            gap: 5,
          }}>
          {restStopOptions.map(option => (
            <Button
              titleStyle={styles.restStopText}
              key={option.id}
              title={option.label}
              onPress={() => toggleRestStopType(option.id)}
              // type={settings.restStopTypes.includes(option.id) ? 'solid' : 'outline'}
              type={settings.restStopTypes[0] === option.id ? 'solid' : 'outline'}
            />
          ))}
        </View>

        {/* Section 2: Number of Rest Stops */}
        <Text style={styles.sectionHeading}>How Many Rest Stops to Show?</Text>
        <View style={styles.counterContainer}>
          <Button
            buttonStyle={styles.countButton}
            titleStyle={styles.buttonText}
            disabled={settings.restStopCount === 1}
            title="-"
            onPress={() => changeRestStopCount(-1)}
          />
          <Text style={styles.countText}>{settings.restStopCount}</Text>
          <Button
            buttonStyle={styles.countButton}
            titleStyle={styles.buttonText}
            disabled={settings.restStopCount === 10}
            title="+"
            onPress={() => changeRestStopCount(1)}
          />
        </View>

        {/* Section 3: Radius of Rest Stops */}
        {/* <Text style={styles.sectionHeading}>Radius of Rest Stops</Text>
        <View style={styles.counterContainer}>
          <Button
            title="-"
            disabled={settings.restStopRadius === 1}
            onPress={() =>
              setSettings(prev => ({...prev, restStopRadius: Math.max(1, prev.restStopRadius - 1)}))
            }
          />
          <Text style={styles.countText}>{settings.restStopRadius} miles</Text>
          <Button
            title="+"
            disabled={settings.restStopRadius === 10}
            onPress={() =>
              setSettings(prev => ({
                ...prev,
                restStopRadius: Math.min(10, prev.restStopRadius + 1),
              }))
            }
          />
        </View> */}

        {/* Section 4: Alert Sound Selection */}
        {/* <Text style={styles.sectionHeading}>Select Alert Sound</Text>
        {alertSoundOptions.map(option => (
          <Button
            key={option.id}
            title={option.label}
            type={settings.alertMsgAndSound === option.id ? 'solid' : 'outline'}
            onPress={() => selectAlertSound(option.id)}
          />
        ))} */}

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <FullWidthButton title="Save" type="primary" onPress={handleSave} />
          <FullWidthButton title="Cancel" type="secondary" onPress={handleBack} />
        </View>
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  buttonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
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
  restStopText: {
    fontSize: 18,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  countText: {
    fontSize: 22,
    fontWeight: '500',
    marginHorizontal: 20,
  },
  buttonText: {
    fontSize: 20,
  },
  countButton: {
    width: 50,
    height: 50,
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
export default SettingsScreen;
