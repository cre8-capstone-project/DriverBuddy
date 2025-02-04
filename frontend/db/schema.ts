import {integer, sqliteTable} from 'drizzle-orm/sqlite-core';

export const settings = sqliteTable('settings', {
  id: integer({mode: 'number'}).primaryKey({autoIncrement: true}),
  dark: integer({mode: 'boolean'}).notNull(),
});
