import {useState, useRef} from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Timestamp} from 'firebase/firestore';
import {useRouter} from 'expo-router';
import {
  createDriver,
  Driver,
  getInvitationCode,
  updateInvitationStatus,
  uploadImage,
} from '@/api/api';
import profilePicturePlaceholder from '@/assets/images/profile_placeholder_with_copyright.jpg';
import * as ImagePicker from 'expo-image-picker';
import {MaterialIcons} from '@expo/vector-icons';
import {Camera} from 'react-native-vision-camera';
import {InvitationCodeType} from '@/types/InvitationCodeType';
import DriveBuddyLogo from '@/assets/images/drivebuddy-logo-name.png';
import FullWidthButton from '@/components/FullWidthButton';
import {useOnboardingTourContext} from '@/contexts/OnboardingTourProvider';
import {Input} from 'react-native-elements';
import {LinearGradient} from 'expo-linear-gradient';
import {ensureDefaultSettings} from '@/utils/utils';
import {Icon} from '@rneui/themed';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState<string | null | undefined>('User');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [validCode, setValidCode] = useState(false);
  const [invitation, setInvitation] = useState<InvitationCodeType | null>(null);
  const [photoUri, setPhotoUri] = useState<string>('');
  const cameraRef = useRef<Camera>(null);
  const {setShowOnboarding} = useOnboardingTourContext();
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleAuth = async () => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      ensureDefaultSettings();
      setShowOnboarding(true);
      let downloadURL: string | undefined = photoUri.trim();
      if (downloadURL !== '') {
        downloadURL = await uploadImage(photoUri, userCredential.user.uid);
      }
      const newDriverObj: Driver = {
        id: userCredential.user.uid,
        name: name ? name : '',
        email: email,
        birthday: Timestamp.fromDate(new Date()),
        picture_url: downloadURL ? downloadURL : '',
        company_id: invitation?.company_id,
      };
      console.log(newDriverObj);
      await createDriver(newDriverObj);
      if (invitation) {
        invitation.status = 'accepted';
        invitation.acceptedAt = Timestamp.fromDate(new Date());
        await updateInvitationStatus(invitation);
      }
    } catch (e) {
      console.error(e);
    }
  };
  const validateCode = async () => {
    try {
      const response = await getInvitationCode(code);
      if (response) {
        if (response.status !== 'pending') return;
        setName(response.recipient_name);
        setInvitation(response);
        setValidCode(true);
      }
    } catch (e) {
      console.error(e);
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
      console.log('Success: Selfie captured!');
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
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#eef4fa']} style={StyleSheet.absoluteFill} />

      {validCode ? (
        <>
          <View style={styles.profileImageContainer}>
            <Text style={{fontSize: 24, textAlign: 'center', marginBottom: 20}}>{name}</Text>
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
            <FullWidthButton type="secondary" title="Upload photo from phone" onPress={pickImage} />
            {/* <Button title="Upload photo from phone" onPress={pickImage} /> */}
            {photoUri !== '' ? (
              <FullWidthButton type="primary" title="Complete" onPress={handleAuth} />
            ) : (
              ''
            )}

            <FullWidthButton type="tertiary" title="Skip this for now" onPress={handleAuth} />
            {/* <Button title="Skip this for now" onPress={handleAuth} /> */}
            {/*<Button title="Take a photo with the camera" onPress={openCamera} />*/}
          </View>
        </>
      ) : (
        <View style={{width: '100%', justifyContent: 'center'}}>
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
            placeholder="Your email address"
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
            style={{borderBottomWidth: 1, marginBottom: 20, padding: 10}}
          /> */}

          <Input
            label="Password"
            labelStyle={{
              fontSize: 15,
              fontWeight: '400',
              color: '#1E3A8A',
            }}
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
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
            rightIcon={
              <TouchableOpacity onPress={togglePasswordVisibility}>
                <Icon
                  name={passwordVisible ? 'eye-off' : 'eye'}
                  type="material-community"
                  color="rgba(30, 58, 138, 0.6)"
                  size={20}
                />
              </TouchableOpacity>
            }
          />
          {/* <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{borderBottomWidth: 1, marginBottom: 20, padding: 10}}
          /> */}

          <Input
            label="Verification code"
            labelStyle={{
              fontSize: 15,
              fontWeight: '400',
              color: '#1E3A8A',
            }}
            placeholder="Code"
            value={code}
            onChangeText={setCode}
            onFocus={() => setFocusedInput('code')}
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
              backgroundColor: focusedInput === 'code' ? '#E6FCFF' : 'white',
            }}
            inputStyle={{
              fontSize: 18,
              color: '#333',
            }}
          />
          {/* <TextInput
            placeholder="Code"
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{borderBottomWidth: 1, marginBottom: 20, padding: 10}}
          /> */}
          <View style={styles.buttonsContainer}>
            <FullWidthButton title="Create an account" type="primary" onPress={validateCode} />
            <View style={{flexDirection: 'row', marginTop: 20, justifyContent: 'center'}}>
              <Text>Have an account? </Text>
              <TouchableOpacity
                onPress={() =>
                  router.replace({
                    pathname: '/signIn',
                    params: {showOnboardingSlide: 'false'},
                  })
                }>
                <Text style={{color: 'blue', fontWeight: 'bold'}}>Sign In</Text>
              </TouchableOpacity>
            </View>
            {/* <FullWidthButton
              title="Have an account? Sign In"
              type="tertiary"
              onPress={() =>
                router.replace({
                  pathname: '/signIn',
                  params: {showOnboardingSlide: 'false'},
                })
              }
            /> */}

            {/* <Button title="Create an account" onPress={validateCode} />
            <Button title="Have an account? Sign In" onPress={() => router.replace('/signIn')} /> */}
          </View>
        </View>
      )}
    </View>
  );
}
const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  buttonsContainer: {
    gap: 10,
    width: '100%',
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
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    gap: 50,
  },
  logoContainer: {
    width: width / 3, // 1/3 of the screen width
    aspectRatio: 1, // Maintain aspect ratio
    marginBottom: 20,
    marginTop: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
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
});
