import {drizzleDb} from '@/db/db';
import {alert} from '@/db/schema';
import type {AlertType} from '@/types/AlertType';

export const AlertService = {
  // async getAllAlerts(): Promise<AlertType[]> {
  //   try {
  //     return await drizzleDb.select().from(alert).orderBy(alert.timestamp);
  //   } catch (error) {
  //     console.error('Failed to retrieve alerts:', error);
  //     throw error;
  //   }
  // },

  async logAlert(newAlert: AlertType): Promise<void> {
    try {
      await drizzleDb.insert(alert).values(newAlert);
    } catch (error) {
      console.error('Failed to add alert:', error);
      throw error;
    }
    console.log('AlertService>logAlert:', newAlert);
  },
};
