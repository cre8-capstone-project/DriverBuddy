import 'react-native-reanimated';
import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import {Suspense, useEffect, useState} from 'react';
import {useMigrations} from 'drizzle-orm/expo-sqlite/migrator';
import {openDatabaseSync, SQLiteProvider} from 'expo-sqlite';
import {useColorScheme} from '@/hooks/useColorScheme';
import migrations from '@/drizzle/migrations';
import {ActivityIndicator} from 'react-native';
import {drizzle} from 'drizzle-orm/expo-sqlite';
import * as schema from '@/db/schema';

SplashScreen.preventAutoHideAsync();
const DATABASE_NAME = 'drivebuddy.db';
const expo = openDatabaseSync(DATABASE_NAME, {enableChangeListener: true});
const db = drizzle(expo, {schema: schema});

export default function RootLayout() {
  const {success, error} = useMigrations(db, migrations);
  const [settings, setSettings] = useState<any>({});
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (error) {
      console.log('Migration error: ' + error.message);
    }
    if (success) {
      console.log('Migrations ran successfully!');
      const loadData = async () => {
        try {
          const response = await db.query.settings.findMany();
          setSettings(response);
          console.log(response);
        } catch (e) {
          console.log(e);
        }
      };
      loadData();
    }
  }, [success, error]);

  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
      <SQLiteProvider
        databaseName={DATABASE_NAME}
        options={{enableChangeListener: true}}
        useSuspense>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{title: 'Index', headerShown: false}} />
            <Stack.Screen name="settings" options={{title: 'Settings'}} />
            <Stack.Screen name="profile" options={{title: 'Profile'}} />
            <Stack.Screen name="history" options={{title: 'History'}} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
