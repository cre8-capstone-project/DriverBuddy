import React from 'react';
import {useState} from 'react';
import {StyleSheet, View, Text, Pressable} from 'react-native';

import {Tabs} from 'expo-router';
import {Icon} from '@rneui/themed';

// Modal visibility state (managed via context or state management)
const useModalVisibility = () => {
  // This is a placeholder - you would implement proper state management
  // This could be via useContext, Redux, Zustand, etc.
  const [isModalVisible, setIsModalVisible] = useState(false);

  return {isModalVisible, setIsModalVisible};
};

export default function TabLayout() {
  const {isModalVisible} = useModalVisibility();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1E3A8A',
        headerShown: false,
        tabBarItemStyle: styles.tabBarItemStyle,
        tabBarStyle: styles.tabBarStyle,
        tabBarLabelStyle: styles.tabBarLabelStyle,
        tabBarButton: props => <Pressable {...props} android_ripple={{color: 'transparent'}} />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({focused}) => (
            <View style={[styles.iconContainer, focused && styles.activeBackground]}>
              <Icon name="home" type="material" size={32} color={focused ? '#1E3A8A' : '#333333'} />
              <Text style={[styles.label, focused && styles.activeLabel]}>Home</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '',
          tabBarIcon: ({focused}) => (
            <View style={[styles.iconContainer, focused && styles.activeBackground]}>
              <Icon
                name="insert-chart"
                type="material"
                size={32}
                color={focused ? '#1E3A8A' : '#333333'}
              />
              <Text style={[styles.label, focused && styles.activeLabel]}>History</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({focused}) => (
            <View style={[styles.iconContainer, focused && styles.activeBackground]}>
              <Icon
                name="person"
                type="material"
                size={32}
                color={focused ? '#1E3A8A' : '#333333'}
              />
              <Text style={[styles.label, focused && styles.activeLabel]}>Profile</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {height: 96, paddingTop: 25},
  tabBarItemStyle: {},
  tabBarLabelStyle: {
    fontSize: 18,
    fontWeight: '500',
  },
  iconContainer: {
    width: 64,
    minHeight: 64,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 6,
  },
  activeBackground: {
    backgroundColor: 'rgba(0, 255, 255, 0.15)',
  },
  label: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
  activeLabel: {
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
});

// import React from 'react';
// import {StyleSheet} from 'react-native';
// import FontAwesome from '@expo/vector-icons/FontAwesome';
// import {Tabs} from 'expo-router';

// export default function TabLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: '#1E3A8A',
//         headerShown: false,
//         tabBarItemStyle: styles.tabBarItemStyle,
//         tabBarStyle: styles.tabBarStyle,
//       }}>
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({color}) => <FontAwesome size={32} name="home" color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="history"
//         options={{
//           title: 'History',
//           tabBarIcon: ({color}) => <FontAwesome size={32} name="bar-chart" color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: 'Profile',
//           tabBarIcon: ({color}) => <FontAwesome size={32} name="user" color={color} />,
//         }}
//       />
//     </Tabs>
//   );
// }

// const styles = StyleSheet.create({
//   tabBarStyle: {height: 96, paddingTop: 10},
//   tabBarItemStyle: {},
// });
