import {sql} from 'drizzle-orm';
import {integer, text, sqliteTable, real} from 'drizzle-orm/sqlite-core';

export const settings = sqliteTable('settings', {
  id: integer({mode: 'number'}).primaryKey({autoIncrement: true}),
  dark: integer({mode: 'boolean'}).notNull(),
});

export const faceDetectionSession = sqliteTable('FaceDetectionSession', {
  faceDetectionSessionId: text('faceDetectionSessionId').primaryKey(),
  userId: text('userId').notNull(),
  startTime: text('startTime'),
  endTime: text('endTime'),
  sessionDuration: integer('sessionDuration').generatedAlwaysAs(
    sql`strftime('%s', endTime) - strftime('%s', startTime)`,
  ),
});

export const alert = sqliteTable('Alert', {
  alertId: text('alertId').primaryKey(),
  userId: text('userId').notNull(),
  faceDetectionSessionId: text('faceDetectionSessionId').notNull(),
  timestamp: text('timestamp').notNull(),
});

export const stops = sqliteTable('Stops', {
  stopId: integer('stopId').primaryKey({autoIncrement: true}),
  journeyId: text('journeyId').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  address: text('address').notNull(),
  name: text('name').notNull(),
  priceLevel: integer('priceLevel'),
  rating: integer('rating'),
  isOrigin: integer('isOrigin', {mode: 'boolean'}).$default(() => false),
  isDestination: integer('isDestination', {mode: 'boolean'}).$default(() => false),
});
