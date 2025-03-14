import {Suspense, useEffect, useState} from 'react';
import 'react-native-reanimated';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFonts} from 'expo-font';
import {Stack, useSegments, useRouter} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {useMigrations} from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations';
import {ActivityIndicator, View} from 'react-native';
import {db, drizzleDb} from '@/db/db';
import * as FileSystem from 'expo-file-system';
import {useDrizzleStudio} from 'expo-drizzle-studio-plugin';
import {ThemeProvider, useTheme} from '@rneui/themed';
import {AuthProvider, useAuth} from '@/contexts/AuthProvider';
import {FaceDetectionProvider} from '@/contexts/FaceDetectionProvider';
import {OnboardingTourProvider} from '@/contexts/OnboardingTourProvider';

import {RootSiblingParent} from 'react-native-root-siblings';
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

  // Auth check component that handles routing
  function AuthenticationGuard({children}: {children: React.ReactNode}) {
    const {user, loading} = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
      if (loading) return; // Don't do anything while still loading

      const inAuthGroup = segments[0] === 'signIn' || segments[0] === 'signUp';

      if (!user && !inAuthGroup) {
        // If no user and not on an auth screen, redirect to sign in page
        router.replace('/signIn');
      } else if (user && inAuthGroup) {
        // If user is logged in and on sign in/up screen, redirect to home
        router.replace('/');
      }
    }, [user, loading, segments]);

    if (loading) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    return <>{children}</>;
  }

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <ThemeUpdater />
        <SafeAreaView style={{flex: 1}} edges={['top']}>
          <Suspense fallback={<ActivityIndicator size="large" />}>
            <AuthenticationGuard>
              <OnboardingTourProvider>
                <FaceDetectionProvider>
                  <RootSiblingParent>
                    <Stack screenOptions={{headerShown: false}}>
                      <Stack.Screen name="(tabs)" />
                      <Stack.Screen name="journey" />
                      <Stack.Screen name="signIn" />
                      <Stack.Screen name="signUp" />
                    </Stack>
                  </RootSiblingParent>
                </FaceDetectionProvider>
              </OnboardingTourProvider>
            </AuthenticationGuard>
          </Suspense>
        </SafeAreaView>
      </ThemeProvider>
    </AuthProvider>
  );
}
