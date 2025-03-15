import {View, Text, StyleSheet} from 'react-native';
import {Card} from '@rneui/themed';

type Props = {
  data: {totalSessionHours: number; totalNumberOfAlert: number};
};

export const SummaryCard = ({data}: Props) => {
  const totalSessionHours = data?.totalSessionHours ?? 'N/A';
  const totalNumberOfAlert = data?.totalNumberOfAlert ?? 'N/A';

  return (
    <Card wrapperStyle={styles.wrapperStyle} containerStyle={styles.containerStyle}>
      <Card.Title style={styles.cardTitle}>Driving Time Overview</Card.Title>
      <View style={styles.contentContainer}>
        <View style={styles.content}>
          <Text style={styles.contentTitle}>{totalSessionHours}</Text>
          <Text style={styles.contentText}>hours with detection</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.contentTitle}>{totalNumberOfAlert}</Text>
          <Text style={styles.contentText}>alerts received</Text>
        </View>
      </View>
    </Card>
  );
};

// Styles will be replaced after the visual design is ready
const styles = StyleSheet.create({
  containerStyle: {
    width: 398,
    height: 170,
    borderRadius: 36,
    padding: 12,
    margin: 0,
    backgroundColor: '#1E3A8A',
    alignSelf: 'center',
  },
  wrapperStyle: {padding: 20},
  cardTitle: {
    textAlign: 'left',
    fontSize: 15,
    fontWeight: 500,
    marginBottom: 20,
    color: 'white',
  },
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
  contentText: {textAlign: 'left', fontSize: 15, fontWeight: 500, color: 'white', marginTop: 10},
});
