import {drizzleDb} from '@/db/db';
import {faceDetectionSession} from '@/db/schema';

export const FDSessionService = {
  async getAllFDSessions() {
    try {
      const result = await drizzleDb.select().from(faceDetectionSession);
      // console.log('FDSession data:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Retrieve FDSession data failed:', error);
      throw error;
    }
  },
};
