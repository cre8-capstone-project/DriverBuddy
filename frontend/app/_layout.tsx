import 'react-native-reanimated';
import {SafeAreaView} from 'react-native-safe-area-context';
import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {useFonts} from 'expo-font';
import {Stack} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import {Suspense, useEffect} from 'react';
import {useMigrations} from 'drizzle-orm/expo-sqlite/migrator';
import {useColorScheme} from '@/hooks/useColorScheme';
import migrations from '@/drizzle/migrations';
import {ActivityIndicator, View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {db, drizzleDb} from '@/db/db';
import * as FileSystem from 'expo-file-system';
import {useDrizzleStudio} from 'expo-drizzle-studio-plugin';
import {RootSiblingParent} from 'react-native-root-siblings';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const {success, error} = useMigrations(drizzleDb, migrations);
  // const [settings, setSettings] = useState<any>({});
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
    // Note: Need to clarify how to use the settings data
    // if (success) {
    //   console.log('Migrations ran successfully!');
    //   const loadData = async () => {
    //     try {
    //       const response = await drizzleDb.query.settings.findMany();
    //       setSettings(response);
    //       console.log(settings);
    //     } catch (e) {
    //       console.log(e);
    //     }
    //   };
    //   loadData();
    // }
  }, [success, error]);

  return (
    <SafeAreaView style={{flex: 1}} edges={['top']}>
      <Suspense fallback={<ActivityIndicator size="large" />}>
        <RootSiblingParent>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{title: 'Index', headerShown: false}} />
              <Stack.Screen name="+not-found" />
              {/* Apply custom header for each screen */}
              {['settings', 'profile', 'history'].map(name => (
                <Stack.Screen
                  key={name}
                  name={name}
                  options={{
                    header: () => (
                      <CustomHeader title={name.charAt(0).toUpperCase() + name.slice(1)} />
                    ),
                  }}
                />
              ))}
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </RootSiblingParent>
      </Suspense>
    </SafeAreaView>
  );
}

// Custom Header Component
type Props = {
  title: string;
};
const CustomHeader = ({title}: Props) => {
  const navigation = useNavigation();

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        onPress={() => navigation.canGoBack() && navigation.goBack()}
        style={styles.backButton}>
        <Icon name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.headerText}>{title}</Text>
      <View style={styles.rightPlaceholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 45,
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  backButton: {padding: 5},
  headerText: {fontSize: 24, fontWeight: 'bold', textAlign: 'center', flex: 1},
  rightPlaceholder: {width: 24},
});
