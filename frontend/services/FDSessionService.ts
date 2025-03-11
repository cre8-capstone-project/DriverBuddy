import {drizzleDb} from '@/db/db';
import {faceDetectionSession, alert} from '@/db/schema';
import type {FDSessionType} from '@/types/FDSessionType';
import {eq} from 'drizzle-orm';

export const FDSessionService = {
  async startFDSession(session: FDSessionType) {
    try {
      await drizzleDb.insert(faceDetectionSession).values(session);
    } catch (error) {
      console.error('Failed to start FDSession:', error);
      throw error;
    }
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
  },

  async getFDSessionDataById(sessionId: string): Promise<FDSessionType> {
    try {
      const sessionResult = await drizzleDb
        .select()
        .from(faceDetectionSession)
        .where(eq(faceDetectionSession.faceDetectionSessionId, sessionId));

      if (!sessionResult.length) {
        throw new Error(`Session with ID ${sessionId} not found.`);
      }

      const alertResults = await drizzleDb
        .select({timestamp: alert.timestamp})
        .from(alert)
        .where(eq(alert.faceDetectionSessionId, sessionId));

      const alertTimestamps = alertResults.map(record => record.timestamp);

      return {
        faceDetectionSessionId: sessionResult[0].faceDetectionSessionId,
        userId: sessionResult[0].userId,
        startTime: sessionResult[0].startTime ?? '',
        endTime: sessionResult[0].endTime ?? '',
        sessionDuration: sessionResult[0].sessionDuration ?? 0,
        alerts: alertTimestamps.length > 0 ? alertTimestamps : undefined,
      };
    } catch (error) {
      console.error('Retrieve FDSession data failed:', error);
      throw error;
    }
  },
};
