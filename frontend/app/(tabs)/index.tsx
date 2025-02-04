import {StyleSheet, View, Text} from 'react-native';

import {useEffect} from 'react';
import {useSQLiteContext} from 'expo-sqlite';
import {drizzle} from 'drizzle-orm/expo-sqlite';
import * as schema from '@/db/schema';

export default function HomeScreen() {
  const contextDb = useSQLiteContext();
  const db = drizzle(contextDb, {schema: schema});

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await db.query.settings.findMany();
        console.log(response);
      } catch (e) {
        console.log(e);
      }
    };
    loadData();
  }, []);
  return (
    <View style={styles.container}>
      <Text>Test</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
});
