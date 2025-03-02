import {View, Text, StyleSheet} from 'react-native';
import {Icon, Button} from '@rneui/themed';
import {useRouter} from 'expo-router';
import StopTester from '@/components/StopTester';

export default function SettingsScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Button
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
      <StopTester />
    </View>
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
});
