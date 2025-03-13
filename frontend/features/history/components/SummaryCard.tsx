import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {Card} from '@rneui/themed';

type Props = {
  data: {totalSessionHours: number; totalNumberOfAlert: number};
  loading: boolean;
};

export const SummaryCard = ({data, loading}: Props) => {
  const totalSessionHours = data?.totalSessionHours ?? 'N/A';
  const totalNumberOfAlert = data?.totalNumberOfAlert ?? 'N/A';

  return (
    <Card wrapperStyle={styles.wrapperStyle} containerStyle={styles.containerStyle}>
      <Card.Title style={styles.cardTitle}>Driving Time Overview</Card.Title>
      <View style={styles.contentContainer}>
        <View style={styles.content}>
          <View style={styles.loading}>
            {loading ? (
              <ActivityIndicator size="large" color="#ffffff" />
            ) : (
              <Text style={styles.contentTitle}>{totalSessionHours}</Text>
            )}
          </View>
          <Text style={styles.contentText}>hours with detection</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.loading}>
            {loading ? (
              <ActivityIndicator size="large" color="#ffffff" />
            ) : (
              <Text style={styles.contentTitle}>{totalNumberOfAlert}</Text>
            )}
          </View>
          <Text style={styles.contentText}>alerts received</Text>
        </View>
      </View>
    </Card>
  );
};

// Styles will be replaced after the visual design is ready
const styles = StyleSheet.create({
  containerStyle: {
    borderRadius: 36,
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
  loading: {alignItems: 'flex-start', height: 40, paddingBottom: 1},
});
