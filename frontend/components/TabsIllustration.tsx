import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {Icon} from '@rneui/themed';

export default function TabsIllustration() {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <View style={[styles.iconContainer]}>
          <Icon name="home" type="material" size={32} color={'#333333'} />
          <Text style={[styles.label]}>Home</Text>
        </View>

        <View style={[styles.iconContainer, styles.activeBackground]}>
          <Icon name="insert-chart" type="material" size={32} color={'#1E3A8A'} />
          <Text style={[styles.label, styles.activeLabel]}>History</Text>
        </View>

        <View style={[styles.iconContainer]}>
          <Icon name="person" type="material" size={32} color={'#333333'} />
          <Text style={styles.label}>Profile</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    height: 96,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  iconContainer: {
    width: 80,
    height: 70,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 6,
  },
  activeBackground: {
    backgroundColor: 'rgba(30, 58, 138, 0.15)',
  },
  label: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    marginTop: 4,
  },
  activeLabel: {
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
});
