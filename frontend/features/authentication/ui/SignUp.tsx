import {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Image,
  Pressable,
  ImageSourcePropType,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Timestamp} from 'firebase/firestore';
import {useRouter} from 'expo-router';
import {createDriver, Driver, getInvitationCode, updateInvitationStatus} from '@/api/api';
import profilePicturePlaceholder from '@/assets/images/profile_placeholder_with_copyright.jpg';
import * as ImagePicker from 'expo-image-picker';
import {MaterialIcons} from '@expo/vector-icons';
import {Camera, useCameraDevice} from 'react-native-vision-camera';
import {InvitationCodeType} from '@/types/InvitationCodeType';

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState<string | null | undefined>('User');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [validCode, setValidCode] = useState(false);
  const [invitation, setInvitation] = useState<InvitationCodeType | null>(null);
  const [photoUri, setPhotoUri] = useState<string>('');
  const cameraRef = useRef<Camera>(null);

  const handleAuth = async () => {
    try {
      const codeIsValid = await validateCode(code.toUpperCase());
      if (codeIsValid) {
        setValidCode(true);
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
    }
  };
  const createAccount = async () => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const newDriverObj: Driver = {
        id: userCredential.user.uid,
        name: name ? name : '',
        email: email,
        birthday: Timestamp.fromDate(new Date()),
        picture_url: photoUri,
        company_id: invitation?.company_id,
      };
      await createDriver(newDriverObj);
      if (invitation) {
        invitation.status = 'accepted';
        await updateInvitationStatus(invitation);
      }
    } catch (e) {
      console.error(e);
    }
  };
  const validateCode = async (code: string) => {
    try {
      const response = await getInvitationCode(code);
      if (response) {
        console.log(response);
        if (response.status !== 'pending') return false;
        setName(response.recipient_name);
        setInvitation(response);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };
  const openCamera = async () => {
    try {
      const hasPermission = await Camera.requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera access is required to take a selfie.');
        return;
      }

      if (!cameraRef.current) {
        Alert.alert('Error', 'Camera not available.');
        return;
      }

      const photo = await cameraRef.current.takePhoto();

      setPhotoUri(`file://${photo.path}`);
      Alert.alert('Success', 'Selfie captured!');
    } catch (e) {
      console.error('Error capturing selfie:', e);
      Alert.alert('Error', 'Failed to take selfie.');
    }
  };
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };
  return (
    <View style={{flex: 1, justifyContent: 'center', padding: 20}}>
      {validCode ? (
        <>
          <Text style={{fontSize: 24, textAlign: 'center', marginBottom: 20}}>{name}</Text>
          <View style={styles.profileImageContainer}>
            <Pressable
              onPress={pickImage}
              style={[styles.profileImageWrapper, styles.profileImageWrapperEdit]}>
              <Image
                style={styles.profileImage}
                source={
                  photoUri
                    ? {uri: photoUri as string}
                    : (profilePicturePlaceholder as ImageSourcePropType)
                }
              />

              <View style={styles.cameraIconOverlay}>
                <MaterialIcons name="photo-camera" size={24} color="white" />
              </View>
            </Pressable>
          </View>
          <View style={styles.buttonsContainer}>
            <Button title="Skip this for now" onPress={createAccount} />
            <Button title="Take a photo with the camera" onPress={openCamera} />
            <Button title="Upload photo from phone" onPress={pickImage} />
            {photoUri !== '' ? <Button title="Complete" onPress={createAccount} /> : ''}
          </View>
        </>
      ) : (
        <View>
          <Text style={{fontSize: 24, textAlign: 'center', marginBottom: 20}}>Sign Up</Text>
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
          <TextInput
            placeholder="Code"
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{borderBottomWidth: 1, marginBottom: 20, padding: 10}}
          />
          <View style={styles.buttonsContainer}>
            <Button title="Sign Up" onPress={handleAuth} />
          </View>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  buttonsContainer: {
    gap: 10,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  profileImageWrapper: {
    position: 'relative',
    borderRadius: 90,
    overflow: 'hidden',
  },
  profileImageWrapperEdit: {
    borderWidth: 2,
    borderColor: '#3498db',
    borderStyle: 'dashed',
  },
  profileImage: {
    width: 160,
    height: 160,
    backgroundColor: '#E0E0E0',
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
