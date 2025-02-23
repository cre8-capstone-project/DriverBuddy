import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ImageSourcePropType,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {getDriverByID} from '@/api/api';
import profilePicturePlaceholder from '@/assets/images/profile_placeholder_with_copyright.jpg';

export default function ProfileScreen() {
  const [driver, setDriver] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);
  const currentUserID: string = 'EupIJaWMSnitQnIIcWi7';
  useEffect(() => {
    const loadData = async () => {
      try {
        const driverInfo = await getDriverByID(currentUserID);
        //console.log(driverInfo);
        setDriver(driverInfo);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <>
      {loading ? (
        <ActivityIndicator size={'large'} />
      ) : driver ? (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.editButton}>
              <MaterialIcons name="edit" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileImageContainer}>
            <Image
              style={styles.profileImage}
              source={
                driver?.picture_url
                  ? {uri: driver.picture_url as string}
                  : (profilePicturePlaceholder as ImageSourcePropType)
              }
            />
          </View>

          <Text style={styles.nameText}>{driver.name}</Text>

          <View style={styles.profileInfoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>User Type:</Text>
              <Text style={styles.value}>{driver.user_type || '-'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Vehicle:</Text>
              <Text style={styles.value}>{driver.vehicle_type || '-'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Birthday:</Text>
              <Text style={styles.value}>{driver.birthday || '-'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{driver.email || '-'}</Text>
            </View>
            {/*
            <View style={styles.infoRow}>
              <Text style={styles.label}>Password:</Text>
              <Text style={styles.value}>**********</Text>
            </View>
            */}
          </View>
        </View>
      ) : (
        <View style={styles.container}>
          <Text style={styles.nameText}>No user information found</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  profileImage: {
    width: 160,
    height: 160,
    borderRadius: 90,
    backgroundColor: '#E0E0E0',
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  profileInfoContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  label: {
    fontWeight: 'bold',
  },
  value: {
    color: 'black',
  },
});

// import {View, Text} from 'react-native';

// export default function ProfileScreen() {
//   return (
//     <View>
//       <Text>Profile Page</Text>
//     </View>
//   );
// }
