import {useState, useRef, useCallback} from 'react';
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

import profilePicturePlaceholder from '@/assets/images/profile_placeholder.png';
import * as ImagePicker from 'expo-image-picker';
import {MaterialIcons} from '@expo/vector-icons';
import {Camera, useCameraDevice, useCameraPermission} from 'react-native-vision-camera';
import {InvitationCodeType} from '@/types/InvitationCodeType';
import DriveBuddyLogo from '@/assets/images/drivebuddy-logo-name.png';
import DriveBuddyLogoNoName from '@/assets/images/drivebuddy-logo-non-name.png';
import FullWidthButton from '@/components/FullWidthButton';
import {useOnboardingTourContext} from '@/contexts/OnboardingTourProvider';
import {Input} from 'react-native-elements';
import {LinearGradient} from 'expo-linear-gradient';
import {ensureDefaultSettings} from '@/utils/utils';
import {Icon} from '@rneui/themed';
import TermAndConditionsDialog from '@/components/TermAndConditionsDialog';
import VerificationErrorDialog from '@/components/VerificationErrorDialog';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState<string | null | undefined>('User');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [validCode, setValidCode] = useState(false);
  const [invitation, setInvitation] = useState<InvitationCodeType | null>(null);
  const [photoUri, setPhotoUri] = useState<string>('');
  const device = useCameraDevice('front');
  const {hasPermission, requestPermission} = useCameraPermission();
  const camera = useRef<Camera>(null);
  const {setShowOnboarding} = useOnboardingTourContext();
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const [showCameraView, setShowCameraView] = useState(false);
  const isFormValid =
    email.trim() !== '' && password.trim() !== '' && code.trim() !== '' && termsChecked;

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const requestCameraPermission = useCallback(async () => {
    const newPermission = await requestPermission();
    if (!newPermission) {
      Alert.alert('Permissions Required', 'Camera permission is needed to use the camera.');
    }
  }, [requestPermission]);
  const takePhoto = useCallback(async () => {
    try {
      if (camera.current == null) throw new Error('Camera ref is null');

      const photo = await camera.current.takePhoto({
        flash: 'off',
        enableShutterSound: true,
      });

      setPhotoUri(`file://${photo.path}`);
      console.log('Success: Selfie captured!');
      setShowCameraView(false);
      // Optional: You can add logic here to save the photo or upload it
    } catch (error) {
      console.error('Failed to take photo', error);
      // Handle error (show alert, etc.)
    }
  }, []);
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
      } else {
        setErrorDialogVisible(true);
      }
    } catch (e) {
      console.error(e);
      setErrorDialogVisible(true);
    }
  };
  if (!hasPermission) {
    requestCameraPermission();
  }

  if (device == null) {
    console.log('No camera device found');
  }

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
    <LinearGradient colors={['#f1f6fa', '#ffffff', '#ffffff']} style={StyleSheet.absoluteFill}>
      <StatusBar translucent backgroundColor="#f1f6fa" style="dark" />
      <SafeAreaView
        style={{flex: 1, backgroundColor: 'transparent'}}
        edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.container}>
          {validCode ? (
            <View>
              {showCameraView && (
                <View style={styles.cameraViewContainer}>
                  <View style={styles.cameraViewWrapper}>
                    <Camera
                      ref={camera}
                      style={StyleSheet.absoluteFill}
                      device={device}
                      isActive={true}
                      photo={true}
                    />
                  </View>
                  <FullWidthButton type="primary" title="Take Photo" onPress={takePhoto} />
                  <FullWidthButton
                    type="secondary"
                    title="Cancel"
                    onPress={() => setShowCameraView(prev => !prev)}
                  />
                </View>
              )}
              <View style={{width: '100%', justifyContent: 'center'}}>
                {/* Logo Container */}
                <View style={styles.logoNoNameContainer}>
                  <Image
                    source={DriveBuddyLogoNoName as ImageSourcePropType}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={{fontSize: 24, textAlign: 'center', marginBottom: 10}}>
                  {photoUri === '' ? "Let's upload your display image" : "You're Looking great!"}
                </Text>
                {photoUri === '' && (
                  <Text style={{fontSize: 16, textAlign: 'center', marginBottom: 0}}>
                    Let's upload your display image
                  </Text>
                )}
                <View style={styles.profileImageContainer}>
                  <Text
                    style={{fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 20}}>
                    {name}
                  </Text>
                  <Pressable onPress={pickImage} style={styles.profileImageWrapper}>
                    <Image
                      style={styles.profileImage}
                      source={
                        photoUri
                          ? {uri: photoUri as string}
                          : (profilePicturePlaceholder as ImageSourcePropType)
                      }
                    />
                  </Pressable>
                </View>
                <View style={styles.buttonsContainer}>
                  <FullWidthButton type="tertiary" title="Skip this for now" onPress={handleAuth} />
                  <FullWidthButton
                    type="secondary"
                    title="Upload photo from phone"
                    icon={{name: 'upload'}}
                    onPress={pickImage}
                  />
                  <FullWidthButton
                    type="secondary"
                    title="Take a photo with the camera"
                    icon={{name: 'camera'}}
                    onPress={() => setShowCameraView(prev => !prev)}
                  />

                  {photoUri !== '' ? (
                    <FullWidthButton type="primary" title="Complete" onPress={handleAuth} />
                  ) : (
                    ''
                  )}
                </View>
              </View>
            </View>
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
              <Input
                label="Verification code"
                labelStyle={{
                  fontSize: 15,
                  fontWeight: '400',
                  color: '#1E3A8A',
                }}
                placeholder="Verification code"
                value={code}
                onChangeText={setCode}
                onFocus={() => setFocusedInput('code')}
                onBlur={() => setFocusedInput(null)}
                containerStyle={{
                  width: '100%',
                  paddingHorizontal: 0,
                  marginBottom: -20,
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
              <Text style={{marginBottom: 30, marginLeft: 5, fontSize: 13}}>
                Please contact your admin to provide this code
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginTop: 10,
                  marginBottom: 30,
                }}>
                <TouchableOpacity onPress={() => setTermsChecked(!termsChecked)}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 1,
                      borderColor: '#1E3A8A',
                      backgroundColor: termsChecked ? '#1E3A8A' : 'white',
                      borderRadius: 6,
                      marginRight: 8,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    {termsChecked && <MaterialIcons name="check" size={18} color="white" />}
                  </View>
                </TouchableOpacity>
                <Text style={{flex: 1, color: '#333', fontSize: 13, lineHeight: 18}}>
                  I confirmed that I have thoroughly read and agreed to the terms and conditions
                  outlined in this{' '}
                  <Text
                    style={{color: '#1E3A8A', fontWeight: 600}}
                    onPress={() => setTermsModalVisible(true)}>
                    User Agreement and Privacy Policy.
                  </Text>
                </Text>
              </View>

              <TermAndConditionsDialog
                dialogVisible={termsModalVisible}
                toggleDialog={() => setTermsModalVisible(false)}
              />

              <View style={styles.buttonsContainer}>
                <FullWidthButton
                  title="Create an account"
                  type="primary"
                  onPress={validateCode}
                  disabled={!isFormValid}
                />
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
              </View>
              <VerificationErrorDialog
                dialogVisible={errorDialogVisible}
                toggleDialog={() => setErrorDialogVisible(false)}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  cameraViewContainer: {
    zIndex: 99,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    height: '100%',
    padding: 10,
    justifyContent: 'space-between',
    gap: 10,
  },
  cameraViewWrapper: {
    width: '100%',
    height: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
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
    borderRadius: 100,
    overflow: 'hidden',
  },
  profileImage: {
    width: 200,
    height: 200,
    backgroundColor: '#E0E0E0',
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
  logoNoNameContainer: {
    width: width / 5, // 1/3 of the screen width
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
