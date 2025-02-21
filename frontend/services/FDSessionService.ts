import {drizzleDb} from '@/db/db';
import {faceDetectionSession} from '@/db/schema';
import {FDSessionType} from '@/types/FDSessionType';
import {eq} from 'drizzle-orm';

export const FDSessionService = {
  async getAllFDSessions() {
    try {
      const result = await drizzleDb.select().from(faceDetectionSession);
      return result;
    } catch (error) {
      console.error('Retrieve FDSession data failed:', error);
      throw error;
    }
  },

  async startFDSession(newFDSession: FDSessionType) {
    try {
      await drizzleDb.insert(faceDetectionSession).values(newFDSession);
    } catch (error) {
      console.error('Failed to start FDSession:', error);
      throw error;
    }
    console.log('Start FDSession:', newFDSession);
  },

  async endFDSession(newFDSession: FDSessionType) {
    try {
      await drizzleDb
        .update(faceDetectionSession)
        .set(newFDSession)
        .where(
          eq(faceDetectionSession.faceDetectionSessionId, newFDSession.faceDetectionSessionId),
        );
    } catch (error) {
      console.error('Failed to end FDSession:', error);
      throw error;
    }
    console.log('End FDSession:', newFDSession);
  },
};
