import {sql} from 'drizzle-orm';
import {integer, text, sqliteTable} from 'drizzle-orm/sqlite-core';

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
  sessionStartMonth: text('sessionStartMonth').generatedAlwaysAs(sql`substr(startTime, 1, 7)`),
  sessionStartDate: text('sessionStartDate').generatedAlwaysAs(sql`substr(startTime, 1, 10)`),
  sessionEndMonth: text('sessionEndMonth').generatedAlwaysAs(sql`substr(endTime, 1, 7)`),
  sessionEndDate: text('sessionEndDate').generatedAlwaysAs(sql`substr(endTime, 1, 10)`),
});

export const alert = sqliteTable('Alert', {
  alertId: text('alertId').primaryKey(),
  userId: text('userId').notNull(),
  faceDetectionSessionId: text('faceDetectionSessionId').notNull(),
  timestamp: text('timestamp').notNull(),
  alertMonth: text('alertMonth').generatedAlwaysAs(sql`substr(timestamp, 1, 7)`),
  alertDate: text('alertDate').generatedAlwaysAs(sql`substr(timestamp, 1, 10)`),
});
