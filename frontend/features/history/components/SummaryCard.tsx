import {View, Text, StyleSheet} from 'react-native';
import {Card} from '@rneui/themed';

type Props = {
  data: {id: number; hours: number; alerts: number}[];
  viewMode: string;
};

export const SummaryCard = ({data, viewMode}: Props) => {
  const totalHours = data.reduce((acc, cur) => acc + cur.hours, 0);
  const totalAlerts = data.reduce((acc, cur) => acc + cur.alerts, 0);

  return (
    <Card wrapperStyle={styles.wrapperStyle} containerStyle={styles.containerStyle}>
      <Card.Title style={styles.cardTitle}>Driving Time Overview</Card.Title>
      <View style={styles.contentContainer}>
        <View style={styles.content}>
          <Text style={styles.contentTitle}>{totalHours}</Text>
          <Text>hours</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.contentTitle}>{totalAlerts}</Text>
          <Text>alerts received</Text>
        </View>
      </View>
    </Card>
  );
};

// Styles will be replaced after the visual design is ready
const styles = StyleSheet.create({
  containerStyle: {borderRadius: 20, padding: 0, margin: 0},
  wrapperStyle: {padding: 15},
  cardTitle: {textAlign: 'left', fontWeight: 'bold', marginBottom: 10},
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor: 'transparent',
    padding: 0,
    margin: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    borderColor: 'transparent',
    boxShadow: 'none',
    padding: 0,
    margin: 0,
  },
  contentTitle: {textAlign: 'left', fontSize: 32},
});
