import {View, Text, StyleSheet} from 'react-native';

type Props = {
  viewMode: string;
};

export const ReportCard = ({viewMode}: Props) => {
  return (
    // TODO:
    // This part will be replaced by fetching data through APIs
    // Now, it generates dummy data for sandbox
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Report
      </Text>
      <Text style={styles.cardText}>Detailed information will be displayed here.</Text>
    </View>
  );
};

// Styles will be replaced after the visual design is ready
const styles = StyleSheet.create({
  card: {
    flex: 3,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {fontSize: 20, fontWeight: 'bold', marginBottom: 5},
  cardText: {fontSize: 14, color: '#666'},
});
