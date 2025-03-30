import React, {useEffect, useState} from 'react';
import {Timestamp} from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {getDriverByID, updateDriver, uploadImage, getCompanyByID} from '@/api/api';
import profilePicturePlaceholder from '@/assets/images/profile_placeholder.png';
// import {Button} from '@rneui/base';
import * as ImagePicker from 'expo-image-picker';
import {useAuth} from '@/contexts/AuthProvider';
import auth from '@react-native-firebase/auth';
import {useRouter} from 'expo-router';
import FullWidthButton from '@/components/FullWidthButton';
import {Input, Icon} from 'react-native-elements';

export default function ProfileScreen() {
  const {user} = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [driver, setDriver] = useState<any>(undefined);
  const [driverName, setDriverName] = useState<string>('');
  const [company, setCompany] = useState<any>(undefined);
  const [driverBirthday, setDriverBirthday] = useState<Date | null>(null);
  const [driverEmail, setDriverEmail] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [originalProfileUrl, setOriginalProfileUrl] = useState<string>('');

  // Added loading state for image operations
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);

  // Add this new state to control date picker visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const currentUserID: string = user ? user.uid : '';
        if (!currentUserID) {
          console.log('No user ID available');
          return;
        }

        setIsImageLoading(true);
        const driverInfo = await getDriverByID(currentUserID);
        console.log(driverInfo);
        if (!driverInfo || !driverInfo.company_id) {
          console.error('Empty driverInfo or missing company_id');
        } else {
          const companyInfo = await getCompanyByID(driverInfo.company_id);
          setCompany(companyInfo);
        }
        setDriver(driverInfo);

        if (driverInfo?.picture_url) {
          setProfileImage(driverInfo.picture_url);
          setOriginalProfileUrl(driverInfo.picture_url);
        } else {
          setProfileImage(null);
        }
        resetEditFields();
      } catch (e) {
        console.error('Error loading driver data:', e);
      } finally {
        setIsImageLoading(false);
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission needed',
            'Sorry, we need camera roll permissions to make this work!',
          );
        }
      }
    })();
  }, []);

  const resetEditFields = () => {
    if (driver) {
      setDriverName(driver.name || '');
      setDriverBirthday(driver.birthday ? new Date(driver.birthday) : null);
      setDriverEmail(driver.email || '');

      // Don't reset profileImage here to avoid conflicting updates
      // Only set it if it's not already set
      if (!profileImage && driver.picture_url) {
        const imageUrl = driver.picture_url.includes('firebasestorage')
          ? `${driver.picture_url}?t=${new Date().getTime()}`
          : driver.picture_url;
        setProfileImage(imageUrl);
      }
    }
  };

  const toggleEdit = () => {
    setEditMode(prevMode => !prevMode);
    setProfileImage(originalProfileUrl);
    setShowDatePicker(false);
    if (!editMode) {
      resetEditFields();
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('New image selected:', result.assets[0].uri);
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const saveChanges = async () => {
    if (isImageLoading) return; // Prevent multiple submissions

    try {
      setIsImageLoading(true);
      let birthdayTimestamp: Timestamp | undefined = undefined;

      if (driverBirthday) {
        birthdayTimestamp = Timestamp.fromDate(driverBirthday);
      }

      // Determine if we need to upload a new image
      let finalImageUrl = driver.picture_url || '';
      const isLocalImage =
        profileImage && (profileImage.startsWith('file:') || profileImage.startsWith('content:'));

      if (isLocalImage) {
        const downloadURL = await uploadImage(profileImage, driver.id);
        if (downloadURL) {
          finalImageUrl = downloadURL;
        } else {
          console.warn('Upload completed but no download URL returned');
        }
      } else if (profileImage && !isLocalImage) {
        finalImageUrl = profileImage.split('?')[0]; // Remove any cache buster
      }
      console.log(finalImageUrl);
      const driverObj = {
        id: driver.id,
        name: driverName,
        email: driverEmail,
        company_id: driver.company_id,
        birthday: birthdayTimestamp,
        picture_url: finalImageUrl,
      };

      const updatedDriver = await updateDriver(driver.id, driverObj);

      // Update the driver state with the new data
      setDriver(updatedDriver);

      // Update profile image with cache buster for Firebase URLs
      if (finalImageUrl && finalImageUrl.includes('firebasestorage')) {
        const cachedUrl = finalImageUrl.includes('?')
          ? `${finalImageUrl}&t=${new Date().getTime()}` // URL already has query params, use &
          : `${finalImageUrl}?t=${new Date().getTime()}`; // URL has no query params, use ?
        setProfileImage(cachedUrl);
        setOriginalProfileUrl(cachedUrl);
      } else {
        setProfileImage(finalImageUrl);
        setOriginalProfileUrl(finalImageUrl);
      }

      // Exit edit mode
      setEditMode(false);
    } catch (e) {
      console.error('Error saving changes:', e);
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setIsImageLoading(false);
    }
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDriverBirthday(selectedDate);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth().signOut();
      router.replace('/signIn'); // Redirect to auth screen after sign out
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Helper function to render the profile image
  const renderProfileImage = () => {
    // Determine if we have a valid image URL
    const hasValidImage = profileImage && profileImage.trim() !== '';

    return (
      <View style={styles.profileImageWrapper}>
        {isImageLoading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}

        <Image
          style={styles.profileImage}
          source={
            hasValidImage ? {uri: profileImage} : (profilePicturePlaceholder as ImageSourcePropType)
          }
          onLoad={() => console.log('Image loaded successfully:', profileImage)}
        />

        {editMode && (
          <View style={styles.cameraIconOverlay}>
            <MaterialIcons name="photo-camera" size={24} color="white" />
          </View>
        )}
      </View>
    );
  };
  return (
    <>
      {loading ? (
        <View style={styles.container}>
          <ActivityIndicator size={'large'} />
        </View>
      ) : driver ? (
        <KeyboardAvoidingView
          style={{flex: 1, backgroundColor: 'white'}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              {/* Cocoy's Update: Add settings icon */}
              <Pressable
                style={[styles.editButton, {right: 60}]}
                onPress={() => router.push('/settings')}>
                {/* ADDED OR UPDATED 19 MAR: Added cog icon to navigate to settings */}
                <MaterialIcons name="settings" size={24} color="black" />
              </Pressable>
              <Pressable style={styles.editButton} onPress={toggleEdit}>
                <MaterialIcons name="edit" size={24} color="black" />
              </Pressable>
            </View>

            <View
              style={[styles.profileImageContainer, editMode && styles.profileImageContainerEdit]}>
              <Pressable
                onPress={editMode ? pickImage : undefined}
                style={[styles.profileImageWrapper, editMode && styles.profileImageWrapperEdit]}>
                {isImageLoading ? <ActivityIndicator size={'large'} /> : renderProfileImage()}
              </Pressable>
              {editMode && <Text style={styles.tapToEditText}>Tap to change photo</Text>}
            </View>
            <View style={styles.container}>
              {editMode ? (
                <View style={styles.form}>
                  {/* User Name Input */}
                  <Input
                    label="User Name"
                    labelStyle={{
                      fontSize: 15,
                      fontWeight: '400',
                      color: '#1E3A8A',
                    }}
                    placeholder="John Doe"
                    value={driverName}
                    onChangeText={setDriverName}
                    onFocus={() => setFocusedInput('driverName')}
                    onBlur={() => setFocusedInput(null)}
                    containerStyle={{
                      width: '100%',
                      paddingHorizontal: 0,
                    }}
                    inputContainerStyle={{
                      height: 56,
                      borderWidth: 1,
                      borderColor: '#1E3A8A',
                      borderRadius: 14,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      backgroundColor: focusedInput === 'driverName' ? '#E6FCFF' : 'white',
                    }}
                    inputStyle={{
                      fontSize: 18,
                      color: '#333',
                    }}
                  />

                  {/* <Input
                    label="User Name"
                    labelStyle={{fontSize: 15, fontWeight: 400, color: '#1E3A8A'}}
                    placeholder="John Doe"
                    value={driverName}
                    onChangeText={setDriverName}
                    containerStyle={{marginBottom: 10}}
                    inputContainerStyle={{borderBottomWidth: 1, borderBottomColor: '#1E3A8A'}}
                  /> */}

                  {/* Email Input */}
                  <Input
                    label="Email"
                    labelStyle={{
                      fontSize: 15,
                      fontWeight: '400',
                      color: '#1E3A8A',
                    }}
                    placeholder="johndoe@gmail.com"
                    value={driverEmail}
                    onChangeText={setDriverEmail}
                    onFocus={() => setFocusedInput('driverEmail')}
                    onBlur={() => setFocusedInput(null)}
                    containerStyle={{
                      width: '100%',
                      paddingHorizontal: 0,
                    }}
                    inputContainerStyle={{
                      height: 56,
                      borderWidth: 1,
                      borderColor: '#1E3A8A',
                      borderRadius: 14,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      backgroundColor: focusedInput === 'driverEmail' ? '#E6FCFF' : 'white',
                    }}
                    inputStyle={{
                      fontSize: 18,
                      color: '#333',
                    }}
                  />

                  {/* <Input
                    label="Email"
                    labelStyle={{fontSize: 15, fontWeight: 400, color: '#1E3A8A'}}
                    placeholder="johndoe@gmail.com"
                    value={driverEmail}
                    onChangeText={setDriverEmail}
                    keyboardType="email-address"
                    containerStyle={{marginBottom: 10}}
                    inputContainerStyle={{borderBottomWidth: 1, borderBottomColor: '#1E3A8A'}}
                  /> */}

                  {/* Birthday Input */}
                  <Pressable onPress={() => setShowDatePicker(true)}>
                    <Input
                      label="Birthday"
                      labelStyle={{
                        fontSize: 15,
                        fontWeight: '400',
                        color: '#1E3A8A',
                      }}
                      placeholder="Select Birthday"
                      value={driverBirthday ? driverBirthday.toDateString() : ''}
                      rightIcon={<Icon name="calendar-today" size={20} color="gray" />}
                      onFocus={() => setFocusedInput('driverBirthday')}
                      onBlur={() => setFocusedInput(null)}
                      containerStyle={{
                        width: '100%',
                        paddingHorizontal: 0,
                      }}
                      inputContainerStyle={{
                        height: 56,
                        borderWidth: 1,
                        borderColor: '#1E3A8A',
                        borderRadius: 14,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        backgroundColor: focusedInput === 'driverBirthday' ? '#E6FCFF' : 'white',
                      }}
                      editable={false}
                      inputStyle={{
                        fontSize: 18,
                        color: '#333',
                      }}
                    />

                    {/* <Input
                      label="Birthday"
                      labelStyle={{fontSize: 15, fontWeight: 400, color: '#1E3A8A'}}
                      placeholder="Select Birthday"
                      value={driverBirthday ? driverBirthday.toDateString() : ''}
                      rightIcon={<Icon name="calendar-today" size={20} color="gray" />}
                      containerStyle={{marginBottom: 10}}
                      inputContainerStyle={{borderBottomWidth: 1, borderBottomColor: '#1E3A8A'}}
                      editable={false}
                    /> */}
                  </Pressable>

                  {/* Only show date picker when showDatePicker is true */}
                  {showDatePicker && (
                    <DateTimePicker
                      value={driverBirthday || new Date()}
                      mode="date"
                      display="default"
                      onChange={onChangeDate}
                    />
                  )}
                  {/* </View> */}

                  <View style={styles.buttonContainer}>
                    <FullWidthButton title="Save Changes" type="primary" onPress={saveChanges} />

                    <FullWidthButton title="Cancel" type="secondary" onPress={toggleEdit} />
                  </View>
                </View>
              ) : (
                <View style={styles.profileInfoContainer}>
                  <Text style={styles.nameText}>{driver.name}</Text>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Company:</Text>
                    <Text style={styles.value}>{company ? company.name : '-'}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Email:</Text>
                    <Text style={styles.value}>{driver.email || '-'}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Birthday:</Text>
                    <Text style={styles.value}>
                      {driver?.birthday ? driver.birthday.toDateString() : '-'}
                    </Text>
                  </View>
                </View>
              )}
              <View style={styles.buttonContainer}>
                <FullWidthButton title="Sign out" type="tertiary" onPress={handleSignOut} />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.container}>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoText}>No user information found</Text>
          </View>
          <FullWidthButton title="Sign out" type="tertiary" onPress={handleSignOut} />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loaderOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 200,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    // padding: 20,
    backgroundColor: 'white',
  },
  infoTextContainer: {
    paddingVertical: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    position: 'absolute',
    left: 20,
  },
  editButton: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: '#1E3A8A',
    padding: 20,
  },
  profileImageContainerEdit: {
    backgroundColor: 'transparent',
  },
  profileImageWrapper: {
    position: 'relative',
    borderRadius: 100,
    width: 200,
    height: 200,
    overflow: 'hidden',
  },
  profileImageWrapperEdit: {
    borderWidth: 2,
    borderColor: '#3498db',
    borderStyle: 'dashed',
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
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
  tapToEditText: {
    marginTop: 8,
    color: '#1E3A8A',
    fontSize: 14,
  },
  nameText: {
    fontSize: 48,
    fontWeight: 500,
    textAlign: 'center',
    marginTop: 10,
  },
  profileInfoContainer: {
    flexDirection: 'column',
    // marginTop: 20,
    paddingHorizontal: 20,
  },
  form: {
    flexDirection: 'column',
    marginTop: 0,
    paddingHorizontal: 20,
  },
  textInput: {
    flex: 1,
    padding: 5,
    paddingLeft: 10,
    height: 50,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 5,
  },
  // Date picker button style
  datePickerButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    height: 50,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 5,
  },
  datePickerText: {
    color: 'black',
  },
  infoRow: {
    marginVertical: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#666666',
  },
  formGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 0,
    paddingVertical: 10,
    width: '100%',
  },
  label: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: 500,
    color: '#666666',
  },
  value: {
    fontSize: 18,
    color: 'black',
  },
  button: {
    width: '100%',
    flex: 1,
    borderRadius: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  buttonContainer: {
    width: '100%', // Ensures the container takes the full width of the form
    gap: 20, // Adds spacing between buttons
    marginTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  fullWidthButton: {
    width: '50%', // Ensures each button takes the full width of the container
    borderRadius: 3,
    textAlign: 'right',
  },
});
