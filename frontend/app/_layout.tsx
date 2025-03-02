import 'react-native-reanimated';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {Suspense, useEffect} from 'react';
import {useMigrations} from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations';
import {ActivityIndicator} from 'react-native';
import {db, drizzleDb} from '@/db/db';
import * as FileSystem from 'expo-file-system';
import {useDrizzleStudio} from 'expo-drizzle-studio-plugin';
import {RootSiblingParent} from 'react-native-root-siblings';
import {ThemeProvider, useTheme} from '@rneui/themed';
import theme from '../components/Theme';

SplashScreen.preventAutoHideAsync();

/**
 * Function to use Theme.tsx
 */
function ThemeUpdater() {
  const {updateTheme} = useTheme();

  useEffect(() => {
    updateTheme(theme);
  }, []);

  return null;
}

export default function RootLayout() {
  const {success, error} = useMigrations(drizzleDb, migrations);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Drizzle Studio only development
  useDrizzleStudio(db);

  // [DEBUG] Check if database file exists
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
  }, [success, error]);

  return (
    <ThemeProvider theme={theme}>
      <ThemeUpdater />
      <SafeAreaView style={{flex: 1}} edges={['top']}>
        <Suspense fallback={<ActivityIndicator size="large" />}>
          <RootSiblingParent>
            <Stack screenOptions={{headerShown: false}}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="journey" />
            </Stack>
          </RootSiblingParent>
        </Suspense>
      </SafeAreaView>
    </ThemeProvider>
  );
}
