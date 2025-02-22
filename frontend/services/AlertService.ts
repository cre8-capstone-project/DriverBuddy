import {sql} from 'drizzle-orm';
import {drizzleDb} from '@/db/db';
import {alert} from '@/db/schema';
import {AlertType} from '@/types/AlertType';
import {faceDetectionSession} from '@/db/schema';

const TIMEZONE = {
  NAME: 'America/Vancouver',
  SQL_OFFSET: '-8 hours',
};

export const AlertService = {
  async getAllAlerts(): Promise<AlertType[]> {
    try {
      return await drizzleDb.select().from(alert).orderBy(alert.timestamp);
    } catch (error) {
      console.error('Failed to retrieve alerts:', error);
      throw error;
    }
  },

  async logAlert(newAlert: AlertType): Promise<void> {
    try {
      await drizzleDb.insert(alert).values(newAlert);
    } catch (error) {
      console.error('Failed to add alert:', error);
      throw error;
    }
    console.log('AlertService>logAlert:', newAlert);
  },

  async getDailyAlertPerHour(date: string): Promise<{hour: number; count: number}[]> {
    console.log(`date: ${date}`);
    try {
      const result = await drizzleDb
        .select({
          hour: sql`strftime('%H', ${alert.timestamp})`.as('hour'),
          count: sql`COUNT(*)`.as('count'),
        })
        .from(alert)
        .where(sql`date(${alert.timestamp}) = date(${date})`)
        .groupBy(sql`strftime('%H', ${alert.timestamp})`)
        .orderBy(sql`hour`);

      return result.map(row => ({
        hour: parseInt(row.hour as string, 10),
        count: row.count as number,
      }));
    } catch (error) {
      console.error('Failed to retrieve hourly alert counts:', error);
      throw error;
    }
  },

  async getWeeklyAlertPerHour(date: string): Promise<{date: string; alertsPerHour: number}[]> {
    try {
      const weekDates = Array.from({length: 7}, (_, i) => {
        const d = new Date(date);
        d.setDate(d.getDate() - d.getDay() + i);
        return d.toLocaleDateString('en-CA', {timeZone: TIMEZONE.NAME});
      });

      const result = await drizzleDb
        .select({
          date: sql`date(datetime(${faceDetectionSession.sessionStartDate}, ${TIMEZONE.SQL_OFFSET}))`.as(
            'date',
          ),
          totalSessionSeconds: sql`SUM(${faceDetectionSession.sessionDuration})`.as(
            'totalSessionSeconds',
          ),
          totalAlerts: sql`COUNT(${alert.alertId})`.as('totalAlerts'),
        })
        .from(faceDetectionSession)
        .leftJoin(
          alert,
          sql`${faceDetectionSession.faceDetectionSessionId} = ${alert.faceDetectionSessionId}`,
        )
        .where(
          sql`date(datetime(${faceDetectionSession.sessionStartDate}, ${TIMEZONE.SQL_OFFSET})) BETWEEN date(${weekDates[0]}) AND date(${weekDates[6]})`,
        )
        .groupBy(
          sql`date(datetime(${faceDetectionSession.sessionStartDate}, ${TIMEZONE.SQL_OFFSET}))`,
        )
        .orderBy(
          sql`date(datetime(${faceDetectionSession.sessionStartDate}, ${TIMEZONE.SQL_OFFSET})) ASC`,
        );

      const resultMap = new Map(
        result.map(row => {
          const totalSessionHours = row.totalSessionSeconds
            ? Number(row.totalSessionSeconds) / 3600
            : 0;
          const totalAlerts = row.totalAlerts ? Number(row.totalAlerts) : 0;
          const alertsPerHour = totalSessionHours > 0 ? totalAlerts / totalSessionHours : 0;
          return [row.date as string, parseFloat(alertsPerHour.toFixed(2))];
        }),
      );

      return weekDates.map(date => ({
        date,
        alertsPerHour: resultMap.get(date) ?? 0,
      }));
    } catch (error) {
      throw error;
    }
  },
};
