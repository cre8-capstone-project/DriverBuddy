import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.editButton}>
          <MaterialIcons name="edit" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileImageContainer}>
        <Image style={styles.profileImage} source={{uri: 'https://via.placeholder.com/150'}} />
      </View>

      {/* 名前 */}
      <Text style={styles.nameText}>John Doe</Text>

      <View style={styles.profileInfoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>User Type:</Text>
          <Text style={styles.value}>Fleet & Logistics Driver</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Vehicle:</Text>
          <Text style={styles.value}>Light Cargo Vehicle</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Birthday:</Text>
          <Text style={styles.value}>April 09, 2000</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>sample@gmail.com</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Password:</Text>
          <Text style={styles.value}>**********</Text>
        </View>
      </View>
    </View>
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
