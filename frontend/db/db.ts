import {openDatabaseSync} from 'expo-sqlite';
import {drizzle} from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const DATABASE_NAME = 'drivebuddy.db';
export const db = openDatabaseSync(DATABASE_NAME, {enableChangeListener: true});
export const drizzleDb = drizzle(db, {schema});
