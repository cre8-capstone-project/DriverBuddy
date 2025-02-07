import {View, Text, StyleSheet} from 'react-native';
import {Button, Card} from '@rneui/themed';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map Demo</Text>
      <Button title="React Native Elements Button" />
      <Card>
        <Card.Title>React Native Elements Card</Card.Title>
        <Card.Divider />
        <Text>Card content goes here.</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
