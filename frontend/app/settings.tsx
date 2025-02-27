import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {Link} from 'expo-router';
import StopTester from '@/components/StopTester';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Link href="/history" asChild>
        <TouchableOpacity style={styles.settingButton}>
          <MaterialIcons name="history" size={24} color="black" />
        </TouchableOpacity>
      </Link>
      <View style={styles.container}>
        <StopTester />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingButton: {
    position: 'absolute',
    textAlign: 'center',
    top: 50,
    // left: 20,
  },
});
