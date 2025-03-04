import {useState} from 'react';
import {View, Text, TextInput, Button, Alert, StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';
import {useRouter} from 'expo-router';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async () => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      router.replace('/'); // Redirect to home after login
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
    }
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', padding: 20}}>
      <Text style={{fontSize: 24, textAlign: 'center', marginBottom: 20}}>Sign In</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{borderBottomWidth: 1, marginBottom: 20, padding: 10}}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{borderBottomWidth: 1, marginBottom: 20, padding: 10}}
      />
      <View style={styles.buttonsContainer}>
        <Button title="Sign In" onPress={handleAuth} />
        <Button title="No account? Sign Up" onPress={() => router.replace('/signUp')} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  buttonsContainer: {
    gap: 10,
  },
});
