import {useLiveQuery, drizzle} from 'drizzle-orm/expo-sqlite';
import {openDatabaseSync} from 'expo-sqlite';
import 'dotenv/config';

const initDatabase = () => {
  const expo = openDatabaseSync(process.env.DB_FILE_NAME!, {enableChangeListener: true});
  const db = drizzle(expo);
  return db;
};

export {initDatabase, useLiveQuery};
