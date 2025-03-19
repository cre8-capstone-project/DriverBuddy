import {useEffect, useState} from 'react';
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  Image,
  ImageSourcePropType,
  Dimensions,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {useRouter, useLocalSearchParams} from 'expo-router';
import DriveBuddyLogo from '@/assets/images/drivebuddy-logo-name.png';
import FullWidthButton from '@/components/FullWidthButton';
import {getDriverByEmail} from '@/api/api';
import Onboarding from '@/components/Onboarding';

export default function SignInScreen() {
  const {showOnboardingSlide} = useLocalSearchParams();
  const [showOnboarding, setShowOnboarding] = useState(
    showOnboardingSlide ? showOnboardingSlide : true,
  );
  useEffect(() => {
    if (showOnboardingSlide == 'false') {
      setShowOnboarding(false);
    } else {
      setShowOnboarding(true);
    }
  }, [showOnboardingSlide]);

  return showOnboarding ? <Onboarding callback={setShowOnboarding} /> : <SignInForm />;
}

const SignInForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async () => {
    try {
      const driver = await getDriverByEmail(email);
      if (driver) {
        await auth().signInWithEmailAndPassword(email, password);
        router.replace('/'); // Redirect to home after login
      } else {
        throw new Error(`There is no driver with this email: ${email}`);
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
    }
  };
  return (
    <View style={styles.container}>
      {/* Logo Container */}
      <View style={styles.logoContainer}>
        <Image
          source={DriveBuddyLogo as ImageSourcePropType}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <View style={styles.buttonsContainer}>
        <FullWidthButton title="Sign In" type="primary" onPress={handleAuth} />
        <FullWidthButton
          title="No account? Sign up"
          type="secondary"
          onPress={() => router.replace('/signUp')}
        />

        {/* <Button title="Sign In" onPress={handleAuth} />
        <Button title="No account? Sign Up" onPress={() => router.replace('/signUp')} /> */}
      </View>
    </View>
  );
};

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
    alignItems: 'center',
  },
  logoContainer: {
    width: width / 3, // 1/3 of the screen width
    aspectRatio: 1, // Maintain aspect ratio
    marginBottom: 20,
    marginTop: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
  buttonsContainer: {
    gap: 10,
    width: '100%',
    alignItems: 'center',
  },
});
