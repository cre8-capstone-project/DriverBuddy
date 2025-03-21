import {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Image,
  ImageSourcePropType,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {useRouter, useLocalSearchParams} from 'expo-router';
import DriveBuddyLogo from '@/assets/images/drivebuddy-logo-name.png';
import FullWidthButton from '@/components/FullWidthButton';
import {getDriverByEmail} from '@/api/api';
import Onboarding from '@/components/Onboarding';
import {Input} from 'react-native-elements';
import {LinearGradient} from 'expo-linear-gradient';

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
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

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
      <LinearGradient colors={['#FFFFFF', '#eef4fa']} style={StyleSheet.absoluteFill} />

      {/* Logo Container */}
      <View style={styles.logoContainer}>
        <Image
          source={DriveBuddyLogo as ImageSourcePropType}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Input
        label="Email"
        labelStyle={{
          fontSize: 15,
          fontWeight: '400',
          color: '#1E3A8A',
        }}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        onFocus={() => setFocusedInput('email')}
        onBlur={() => setFocusedInput(null)}
        containerStyle={{
          width: '100%',
          paddingHorizontal: 0,
        }}
        inputContainerStyle={{
          borderWidth: 1,
          borderColor: '#1E3A8A',
          borderRadius: 14,
          paddingHorizontal: 10,
          paddingVertical: 6,
          backgroundColor: focusedInput === 'email' ? '#E6FCFF' : 'white',
        }}
        inputStyle={{
          fontSize: 18,
          color: '#333',
        }}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {/* <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      /> */}

      <Input
        label="Password"
        labelStyle={{
          fontSize: 15,
          fontWeight: '400',
          color: '#1E3A8A',
        }}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        onFocus={() => setFocusedInput('password')}
        onBlur={() => setFocusedInput(null)}
        containerStyle={{
          width: '100%',
          paddingHorizontal: 0,
        }}
        inputContainerStyle={{
          borderWidth: 1,
          borderColor: '#1E3A8A',
          borderRadius: 14,
          paddingHorizontal: 10,
          paddingVertical: 6,
          backgroundColor: focusedInput === 'password' ? '#E6FCFF' : 'white',
        }}
        inputStyle={{
          fontSize: 18,
          color: '#333',
        }}
      />
      {/* <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      /> */}

      <View style={styles.buttonsContainer}>
        <FullWidthButton title="Sign In" type="primary" onPress={handleAuth} />
        <View style={{flexDirection: 'row', marginTop: 20, justifyContent: 'center'}}>
          <Text>I do not have an account yet </Text>
          <TouchableOpacity onPress={() => router.replace('/signUp')}>
            <Text style={{color: 'blue', fontWeight: 'bold'}}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        {/* <FullWidthButton
          title="No account? Sign up"
          type="secondary"
          onPress={() => router.replace('/signUp')}
        /> */}

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
