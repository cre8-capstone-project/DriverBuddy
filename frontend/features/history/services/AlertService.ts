import {drizzleDb} from '@/db/db';
import {alert} from '@/db/schema';

export const AlertService = {
  async getAllAlerts() {
    try {
      const result = await drizzleDb.select().from(alert).orderBy(alert.timestamp);
      // console.log('Alert data:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Retrieve alert data failed:', error);
      throw error;
    }
  },
};
