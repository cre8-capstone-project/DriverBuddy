import {drizzleDb} from '@/db/db';
import {stops} from '@/db/schema';
import {StopsType} from '@/types/StopsType';

export const StopsService = {
  async getAllStops() {
    try {
      const result = await drizzleDb.select().from(stops);
      return result;
    } catch (error) {
      console.error('Retrieve Stop data failed:', error);
      throw error;
    }
  },
  async addStop(stopObj: StopsType) {
    try {
      await drizzleDb.insert(stops).values(stopObj);
    } catch (error) {
      console.error('Add Stop data failed:', error);
      throw error;
    }
  },
  async emptyStopTable() {
    try {
      await drizzleDb.delete(stops);
    } catch (error) {
      console.error('Emptying Stop table failed:', error);
      throw error;
    }
  },
};
