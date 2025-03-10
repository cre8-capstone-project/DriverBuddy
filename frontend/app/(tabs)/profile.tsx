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
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {getDriverByID, updateDriver, uploadImage} from '@/api/api';
import profilePicturePlaceholder from '@/assets/images/profile_placeholder_with_copyright.jpg';
import {Button} from '@rneui/base';
import * as ImagePicker from 'expo-image-picker';
import {useAuth} from '@/contexts/AuthProvider';
import auth from '@react-native-firebase/auth';
import {useRouter} from 'expo-router';
import theme from '@/components/Theme';

export default function ProfileScreen() {
  const {user} = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const [driver, setDriver] = useState<any>(undefined);
  const [driverName, setDriverName] = useState<string>('');
  const [driverUserType, setDriverUserType] = useState<string>('');
  const [driverVehicleType, setDriverVehicleType] = useState<string>('');
  const [driverBirthday, setDriverBirthday] = useState<Date | null>(null);
  const [driverEmail, setDriverEmail] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Added loading state for image operations
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);

  // Add this new state to control date picker visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(false);
        const currentUserID: string = user ? user.uid : '';
        if (!currentUserID) {
          console.log('No user ID available');
          return;
        }

        setIsImageLoading(true);
        const driverInfo = await getDriverByID(currentUserID);
        setDriver(driverInfo);

        if (driverInfo?.picture_url) {
          console.log('Profile image URL from database:', driverInfo.picture_url);
          setProfileImage(driverInfo.picture_url);
        } else {
          console.log('No profile image URL found in driver info');
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
      setDriverUserType(driver.user_type || '');
      setDriverVehicleType(driver.vehicle_type || '');
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
    setShowDatePicker(false);
    if (!editMode) {
      // Only reset when entering edit mode, not when exiting
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

      if (!driverBirthday) {
        throw new Error('Birthday is required');
      }

      const birthdayTimestamp: Timestamp = Timestamp.fromDate(driverBirthday);

      // Determine if we need to upload a new image
      let finalImageUrl = driver.picture_url || '';
      const isLocalImage =
        profileImage && (profileImage.startsWith('file:') || profileImage.startsWith('content:'));

      if (isLocalImage) {
        console.log('Uploading new image from local URI');
        const downloadURL = await uploadImage(profileImage, driver.id);
        if (downloadURL) {
          console.log('Upload successful, new URL:', downloadURL);
          finalImageUrl = downloadURL;
        } else {
          console.warn('Upload completed but no download URL returned');
        }
      } else if (profileImage && !isLocalImage) {
        console.log('Using existing remote image URL');
        finalImageUrl = profileImage.split('?')[0]; // Remove any cache buster
      }

      const driverObj = {
        id: driver.id,
        user_type: driverUserType,
        name: driverName,
        email: driverEmail,
        phone: driver.phone,
        vehicle_type: driverVehicleType,
        birthday: birthdayTimestamp,
        picture_url: finalImageUrl,
      };

      console.log('Updating driver with picture URL:', finalImageUrl);
      const updatedDriver = await updateDriver(driver.id, driverObj);

      // Update the driver state with the new data
      setDriver(updatedDriver);

      // Update profile image with cache buster for Firebase URLs
      if (finalImageUrl && finalImageUrl.includes('firebasestorage')) {
        const cachedUrl = finalImageUrl.includes('?')
          ? `${finalImageUrl}&t=${new Date().getTime()}` // URL already has query params, use &
          : `${finalImageUrl}?t=${new Date().getTime()}`; // URL has no query params, use ?
        console.log('Setting profile image with cache buster:', cachedUrl);
        setProfileImage(cachedUrl);
      } else {
        setProfileImage(finalImageUrl);
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

    // Log details for debugging
    console.log('Current profile image state:', {
      hasValidImage,
      profileImage,
      isLoading: isImageLoading,
    });

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
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Pressable style={styles.editButton} onPress={toggleEdit}>
                <MaterialIcons name="edit" size={24} color="black" />
              </Pressable>
            </View>

            <View style={styles.profileImageContainer}>
              <Pressable
                onPress={editMode ? pickImage : undefined}
                style={[styles.profileImageWrapper, editMode && styles.profileImageWrapperEdit]}>
                {isImageLoading ? <ActivityIndicator size={'large'} /> : renderProfileImage()}
                {editMode && (
                  <View style={styles.cameraIconOverlay}>
                    <MaterialIcons name="photo-camera" size={24} color="white" />
                  </View>
                )}
              </Pressable>
              {editMode && <Text style={styles.tapToEditText}>Tap to change photo</Text>}
            </View>
            <View style={styles.container}>
              {editMode ? (
                <View style={styles.form}>
                  <View style={styles.formGroup}>
                    <TextInput
                      style={styles.textInput}
                      value={driverName}
                      onChangeText={setDriverName}
                      placeholder="Name"
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <TextInput
                      style={styles.textInput}
                      value={driverEmail}
                      onChangeText={setDriverEmail}
                      placeholder="Email"
                      inputMode="email"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    {/* Date picker button */}
                    <Pressable
                      style={styles.datePickerButton}
                      onPress={() => setShowDatePicker(true)}>
                      <Text style={styles.datePickerText}>
                        {driverBirthday ? driverBirthday.toDateString() : 'Select Birthday'}
                      </Text>
                      <MaterialIcons name="calendar-today" size={18} color="gray" />
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
                  </View>
                  <View style={styles.buttonContainer}>
                    <Button size="md" buttonStyle={styles.fullWidthButton} onPress={saveChanges}>
                      Save Changes
                    </Button>

                    <Button
                      type="outline"
                      size="md"
                      buttonStyle={styles.fullWidthButton}
                      onPress={toggleEdit}>
                      Cancel
                    </Button>
                  </View>
                </View>
              ) : (
                <View style={styles.profileInfoContainer}>
                  <Text style={styles.nameText}>{driver.name}</Text>

                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Company</Text>
                    <Text style={styles.value}>
                      {driver.company_name ? driver.company_name : '-'}
                    </Text>
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
            </View>
            <View style={styles.container}>
              <Button onPress={handleSignOut}>Sign out</Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.container}>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoText}>No user information found</Text>
          </View>
          <Button onPress={handleSignOut}>Sign out</Button>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
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
    padding: 20,
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
    marginTop: 20,
    backgroundColor: theme.lightColors?.primary,
    padding: 10,
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
    width: 180,
    height: 180,
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
    color: '#3498db',
    fontSize: 14,
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  profileInfoContainer: {
    flexDirection: 'column',
    marginTop: 20,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    fontWeight: 'bold',
  },
  value: {
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
    gap: 10, // Adds spacing between buttons
    paddingBottom: 20,
  },
  fullWidthButton: {
    width: '100%', // Ensures each button takes the full width of the container
    borderRadius: 3,
  },
});
