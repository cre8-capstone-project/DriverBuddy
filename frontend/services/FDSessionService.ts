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

  async startFDSession(session: FDSessionType) {
    try {
      await drizzleDb.insert(faceDetectionSession).values(session);
    } catch (error) {
      console.error('Failed to start FDSession:', error);
      throw error;
    }
    console.log('Start FDSession:', session);
  },

  async endFDSession(session: FDSessionType) {
    try {
      await drizzleDb
        .update(faceDetectionSession)
        .set(session)
        .where(eq(faceDetectionSession.faceDetectionSessionId, session.faceDetectionSessionId));
    } catch (error) {
      console.error('Failed to end FDSession:', error);
      throw error;
    }
    console.log('End FDSession:', session);
  },
};
