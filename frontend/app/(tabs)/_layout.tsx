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
        tabBarStyle: styles.tabBarStyle,
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
  tabBarStyle: {height: 96, paddingTop: 30},
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
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
  activeLabel: {
    color: '#1E3A8A',
  },
});
