import 'react-native-reanimated';
import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import {Suspense, useEffect, useState} from 'react';
import {useMigrations} from 'drizzle-orm/expo-sqlite/migrator';
import {useColorScheme} from '@/hooks/useColorScheme';
import migrations from '@/drizzle/migrations';
import {ActivityIndicator} from 'react-native';
import {db, drizzleDb} from '@/db/db';
import * as FileSystem from 'expo-file-system';
import {useDrizzleStudio} from 'expo-drizzle-studio-plugin';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const {success, error} = useMigrations(drizzleDb, migrations);
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

  useDrizzleStudio(db);

  useEffect(() => {
    const checkDatabaseFile = async () => {
      const dbPath = `${FileSystem.documentDirectory}SQLite/drivebuddy.db`;
      const fileInfo = await FileSystem.getInfoAsync(dbPath);

      if (fileInfo.exists) {
        console.log(`You have a database file: ${dbPath}`);
      } else {
        console.log(`You don't have a database file: ${dbPath}`);
      }
    };
    checkDatabaseFile();
  }, []);

  useEffect(() => {
    if (error) {
      console.log('Migration error: ' + error.message);
    }
    if (success) {
      console.log('Migrations ran successfully!');
      const loadData = async () => {
        try {
          const response = await drizzleDb.query.settings.findMany();
          setSettings(response);
          console.log(settings);
        } catch (e) {
          console.log(e);
        }
      };
      loadData();
    }
  }, [success, error]);

  return (
    <Suspense fallback={<ActivityIndicator size="large" />}>
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
    </Suspense>
  );
}
