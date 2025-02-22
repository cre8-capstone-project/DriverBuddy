import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

type LegendItem = {
  label: string;
  color: string;
  description: string;
};

type Props = {
  legend: LegendItem[];
};

export const Legend = ({legend}: Props) => {
  return (
    <View style={styles.container}>
      {legend.map((item, index) => (
        <View key={index}>
          <View style={styles.itemContainer}>
            <View style={[styles.colorBox, {backgroundColor: item.color}]} />
            <Text style={styles.label}>{item.label}</Text>
          </View>
          <Text>{item.description}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 10,
  },
  colorBox: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  label: {
    fontSize: 14,
  },
});
