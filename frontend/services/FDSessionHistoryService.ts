import {sql} from 'drizzle-orm';
import {drizzleDb} from '@/db/db';
import {alert} from '@/db/schema';
import {faceDetectionSession} from '@/db/schema';
import type {FDSessionHistoryType} from '@/types/FDSessionType';

const TIMEZONE = {
  NAME: 'America/Vancouver',
  SQL_OFFSET: '-8 hours',
};

// TODO: For Offline mode (Get data from SQLite)
export const FDSessionHistoryService = {
  async getDataByDay(date: Date): Promise<FDSessionHistoryType> {
    try {
      const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      const dayHours = Array.from({length: 24}, (_, i) => {
        const hour = String(i).padStart(2, '0');
        return `${dateString} ${hour}:00:00`;
      });

      const result = await drizzleDb
        .select({
          hour: sql`strftime('%H', datetime(${faceDetectionSession.startTime}, ${TIMEZONE.SQL_OFFSET}))`.as(
            'hour',
          ),
          totalSessionHours:
            sql`ROUND(SUM(CAST(${faceDetectionSession.sessionDuration} AS REAL) / 3600.0), 2)`.as(
              'totalSessionHours',
            ),
          totalNumberOfAlert: sql`COUNT(${alert.alertId})`.as('totalNumberOfAlert'),
          alertPerHour:
            sql`ROUND(COUNT(${alert.alertId}) / (SUM(CAST(${faceDetectionSession.sessionDuration} AS REAL) / 3600.0)), 2)`.as(
              'alertsPerHour',
            ),
        })
        .from(faceDetectionSession)
        .leftJoin(
          alert,
          sql`${faceDetectionSession.faceDetectionSessionId} = ${alert.faceDetectionSessionId}`,
        )
        .where(
          sql`datetime(${faceDetectionSession.startTime}, ${TIMEZONE.SQL_OFFSET})
             BETWEEN datetime(${dateString + ' 00:00:00'})
             AND datetime(${dateString + ' 23:59:59'})`,
        )
        .groupBy(sql`hour`)
        .orderBy(sql`hour ASC`);

      console.log('SQL result (Day):', result);

      // Calculate Summary Data
      const totalSessionHours = result.reduce(
        (acc, row) => acc + (row.totalSessionHours ? Number(row.totalSessionHours) : 0),
        0,
      );
      const totalNumberOfAlert = result.reduce(
        (acc, row) => acc + (row.totalNumberOfAlert ? Number(row.totalNumberOfAlert) : 0),
        0,
      );

      // Calculate Hourly Data
      const processedData = dayHours.map(dateTime => {
        const hour = dateTime.split(' ')[1].split(':')[0];
        const row = result.find(r => r.hour === hour);
        const totalSessionHours = row?.totalSessionHours ? Number(row.totalSessionHours) : 0;
        const totalAlerts = row?.totalNumberOfAlert ? Number(row.totalNumberOfAlert) : 0;
        const alertsPerHour = totalSessionHours > 0 ? totalAlerts / totalSessionHours : 0;

        return {
          date: dateTime,
          totalSessionHours: parseFloat(totalSessionHours.toFixed(2)),
          totalNumberOfAlert: totalAlerts,
          alertPerHour: parseFloat(alertsPerHour.toFixed(2)),
        };
      });

      return {
        totalSessionHours: parseFloat(totalSessionHours.toFixed(2)),
        totalNumberOfAlert: totalNumberOfAlert,
        data: processedData,
      };
    } catch (error) {
      throw error;
    }
  },

  async getDataByWeek(date: Date): Promise<FDSessionHistoryType> {
    try {
      const weekDates = Array.from({length: 7}, (_, i) => {
        date.setDate(date.getDate() - date.getDay() + i);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      });

      const result = await drizzleDb
        .select({
          date: sql`date(datetime(${faceDetectionSession.startTime}, ${TIMEZONE.SQL_OFFSET}))`.as(
            'date',
          ),
          totalSessionHours:
            sql`ROUND(SUM(CAST(${faceDetectionSession.sessionDuration} AS REAL) / 3600.0), 2)`.as(
              'totalSessionHours',
            ),
          totalNumberOfAlert: sql`COUNT(${alert.alertId})`.as('totalNumberOfAlert'),
          alertPerHour:
            sql`ROUND(COUNT(${alert.alertId}) / (SUM(CAST(${faceDetectionSession.sessionDuration} AS REAL) / 3600.0)), 2)`.as(
              'alertsPerHour',
            ),
        })
        .from(faceDetectionSession)
        .leftJoin(
          alert,
          sql`${faceDetectionSession.faceDetectionSessionId} = ${alert.faceDetectionSessionId}`,
        )
        .where(
          sql`date(datetime(${faceDetectionSession.startTime}, ${TIMEZONE.SQL_OFFSET})) BETWEEN date(${weekDates[0]}) AND date(${weekDates[6]})`,
        )
        .groupBy(sql`date(datetime(${faceDetectionSession.startTime}, ${TIMEZONE.SQL_OFFSET}))`)
        .orderBy(
          sql`date(datetime(${faceDetectionSession.startTime}, ${TIMEZONE.SQL_OFFSET})) ASC`,
        );
      console.log('SQL result (Week):', result);

      // Calculate Summary Data
      const totalSessionHours = result.reduce(
        (acc, row) => acc + (row.totalSessionHours ? Number(row.totalSessionHours) : 0),
        0,
      );
      const totalNumberOfAlert = result.reduce(
        (acc, row) => acc + (row.totalNumberOfAlert ? Number(row.totalNumberOfAlert) : 0),
        0,
      );

      // Calculate Daily Data
      const processedData = weekDates.map(date => {
        const row = result.find(r => r.date === date);
        const totalSessionHours = row?.totalSessionHours ? Number(row.totalSessionHours) : 0;
        const totalAlerts = row?.totalNumberOfAlert ? Number(row.totalNumberOfAlert) : 0;
        const alertsPerHour = totalSessionHours > 0 ? totalAlerts / totalSessionHours : 0;

        return {
          date,
          totalSessionHours: parseFloat(totalSessionHours.toFixed(2)),
          totalNumberOfAlert: totalAlerts,
          alertPerHour: parseFloat(alertsPerHour.toFixed(2)),
        };
      });

      return {
        totalSessionHours: parseFloat(totalSessionHours.toFixed(2)),
        totalNumberOfAlert: totalNumberOfAlert,
        data: processedData,
      };
    } catch (error) {
      throw error;
    }
  },

  async getDataByMonth(date: Date): Promise<FDSessionHistoryType> {
    try {
      const monthDates = Array.from(
        {
          length: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(),
        },
        (_, i) => {
          date.setDate(i + 1);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; // YYYY-MM-DD形式
        },
      );

      const result = await drizzleDb
        .select({
          date: sql`date(datetime(${faceDetectionSession.startTime}, ${TIMEZONE.SQL_OFFSET}))`.as(
            'date',
          ),
          totalSessionHours:
            sql`ROUND(SUM(CAST(${faceDetectionSession.sessionDuration} AS REAL) / 3600.0), 2)`.as(
              'totalSessionHours',
            ),
          totalNumberOfAlert: sql`COUNT(${alert.alertId})`.as('totalNumberOfAlert'),
          alertPerHour:
            sql`ROUND(COUNT(${alert.alertId}) / (SUM(CAST(${faceDetectionSession.sessionDuration} AS REAL) / 3600.0)), 2)`.as(
              'alertsPerHour',
            ),
        })
        .from(faceDetectionSession)
        .leftJoin(
          alert,
          sql`${faceDetectionSession.faceDetectionSessionId} = ${alert.faceDetectionSessionId}`,
        )
        .where(
          sql`date(datetime(${faceDetectionSession.startTime}, ${TIMEZONE.SQL_OFFSET})) BETWEEN date(${monthDates[0]}) AND date(${monthDates[29]})`,
        )
        .groupBy(sql`date(datetime(${faceDetectionSession.startTime}, ${TIMEZONE.SQL_OFFSET}))`)
        .orderBy(
          sql`date(datetime(${faceDetectionSession.startTime}, ${TIMEZONE.SQL_OFFSET})) ASC`,
        );
      console.log('SQL result (Month):', result);

      // Calculate Summary Data
      const totalSessionHours = result.reduce(
        (acc, row) => acc + (row.totalSessionHours ? Number(row.totalSessionHours) : 0),
        0,
      );
      const totalNumberOfAlert = result.reduce(
        (acc, row) => acc + (row.totalNumberOfAlert ? Number(row.totalNumberOfAlert) : 0),
        0,
      );

      // Calculate Daily Data
      const processedData = monthDates.map(date => {
        const row = result.find(r => r.date === date);
        const totalSessionHours = row?.totalSessionHours ? Number(row.totalSessionHours) : 0;
        const totalAlerts = row?.totalNumberOfAlert ? Number(row.totalNumberOfAlert) : 0;
        const alertsPerHour = totalSessionHours > 0 ? totalAlerts / totalSessionHours : 0;

        return {
          date,
          totalSessionHours: parseFloat(totalSessionHours.toFixed(2)),
          totalNumberOfAlert: totalAlerts,
          alertPerHour: parseFloat(alertsPerHour.toFixed(2)),
        };
      });

      return {
        totalSessionHours: parseFloat(totalSessionHours.toFixed(2)),
        totalNumberOfAlert: totalNumberOfAlert,
        data: processedData,
      };
    } catch (error) {
      throw error;
    }
  },

  async getDataByYear(date: Date): Promise<FDSessionHistoryType> {
    try {
      const year = date.getFullYear();

      const yearMonths = Array.from({length: 12}, (_, i) => {
        const month = String(i + 1).padStart(2, '0');
        return `${year}-${month}-01`;
      });

      const result = await drizzleDb
        .select({
          month:
            sql`strftime('%m', datetime(${faceDetectionSession.startTime}, ${TIMEZONE.SQL_OFFSET}))`.as(
              'month',
            ),
          totalSessionHours:
            sql`ROUND(SUM(CAST(${faceDetectionSession.sessionDuration} AS REAL) / 3600.0), 2)`.as(
              'totalSessionHours',
            ),
          totalNumberOfAlert: sql`COUNT(${alert.alertId})`.as('totalNumberOfAlert'),
          alertPerHour:
            sql`ROUND(COUNT(${alert.alertId}) / (SUM(CAST(${faceDetectionSession.sessionDuration} AS REAL) / 3600.0)), 2)`.as(
              'alertsPerHour',
            ),
        })
        .from(faceDetectionSession)
        .leftJoin(
          alert,
          sql`${faceDetectionSession.faceDetectionSessionId} = ${alert.faceDetectionSessionId}`,
        )
        .where(
          sql`strftime('%Y', datetime(${faceDetectionSession.startTime}, ${TIMEZONE.SQL_OFFSET})) = ${String(year)}`,
        )
        .groupBy(sql`month`)
        .orderBy(sql`month ASC`);

      console.log('SQL result (Year):', result);

      // Calculate Summary Data
      const totalSessionHours = result.reduce(
        (acc, row) => acc + (row.totalSessionHours ? Number(row.totalSessionHours) : 0),
        0,
      );
      const totalNumberOfAlert = result.reduce(
        (acc, row) => acc + (row.totalNumberOfAlert ? Number(row.totalNumberOfAlert) : 0),
        0,
      );

      // Calculate Monthly Data
      const processedData = yearMonths.map((dateTime, index) => {
        const month = String(index + 1).padStart(2, '0');
        const row = result.find(r => r.month === month);
        const totalSessionHours = row?.totalSessionHours ? Number(row.totalSessionHours) : 0;
        const totalAlerts = row?.totalNumberOfAlert ? Number(row.totalNumberOfAlert) : 0;
        const alertsPerHour = totalSessionHours > 0 ? totalAlerts / totalSessionHours : 0;

        return {
          date: dateTime,
          totalSessionHours: parseFloat(totalSessionHours.toFixed(2)),
          totalNumberOfAlert: totalAlerts,
          alertPerHour: parseFloat(alertsPerHour.toFixed(2)),
        };
      });

      return {
        totalSessionHours: parseFloat(totalSessionHours.toFixed(2)),
        totalNumberOfAlert: totalNumberOfAlert,
        data: processedData,
      };
    } catch (error) {
      console.error('Error fetching yearly data:', error);
      throw error;
    }
  },
};
