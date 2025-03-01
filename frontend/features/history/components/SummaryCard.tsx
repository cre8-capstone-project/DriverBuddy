import {View, Text, StyleSheet} from 'react-native';
import {Card} from '@rneui/themed';

type Props = {
  data: {totalSessionHours: number; totalNumberOfAlert: number};
};

export const SummaryCard = ({data}: Props) => {
  return (
    <Card wrapperStyle={styles.wrapperStyle} containerStyle={styles.containerStyle}>
      <Card.Title style={styles.cardTitle}>Driving Time Overview</Card.Title>
      <View style={styles.contentContainer}>
        <View style={styles.content}>
          <Text style={styles.contentTitle}>{data.totalSessionHours}</Text>
          <Text style={styles.contentText}>hours with detection</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.contentTitle}>{data.totalNumberOfAlert}</Text>
          <Text style={styles.contentText}>alerts received</Text>
        </View>
      </View>
    </Card>
  );
};

// Styles will be replaced after the visual design is ready
const styles = StyleSheet.create({
  containerStyle: {
    borderRadius: 20,
    padding: 0,
    margin: 0,
    backgroundColor: '#1E3A8A',
  },
  wrapperStyle: {padding: 20},
  cardTitle: {textAlign: 'left', fontWeight: 'bold', marginBottom: 10, color: 'white'},
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
  contentTitle: {textAlign: 'left', fontSize: 32, color: 'white'},
  contentText: {textAlign: 'left', color: 'white'},
});
