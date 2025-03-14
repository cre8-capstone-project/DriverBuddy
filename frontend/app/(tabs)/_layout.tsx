import {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {BlurView} from 'expo-blur';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {Tabs} from 'expo-router';

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
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#1E3A8A',
          headerShown: false,
          tabBarStyle: styles.tabBarStyle,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({color}) => <FontAwesome size={28} name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({color}) => <FontAwesome size={28} name="bar-chart" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({color}) => <FontAwesome size={28} name="user" color={color} />,
          }}
        />
      </Tabs>
      {isModalVisible && (
        <View style={styles.blurredTabContainer}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {height: 80, paddingTop: 10},
  blurredTabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 83, // Adjust based on your tab bar height including safe area
  },
});
