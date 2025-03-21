import {drizzleDb} from '@/db/db';
import {settings, restStopTypes} from '@/db/schema';

export const ensureDefaultSettings = async () => {
  try {
    const existingSettings = await drizzleDb.select().from(settings).limit(1);

    if (existingSettings.length === 0) {
      // Create default settings
      const [inserted] = await drizzleDb
        .insert(settings)
        .values({
          restStopCount: 3,
          restStopRadius: 5,
          alertMsgAndSound: 1,
        })
        .returning({id: settings.id});

      // Add the default rest stop type (Gas Stations)
      await drizzleDb.insert(restStopTypes).values({
        settingsId: inserted.id,
        stopType: 1,
      });

      console.log('Default settings created.');
    } else {
      console.log('Settings already exist.');
    }
  } catch (error) {
    console.error('Error ensuring default settings:', error);
  }
};
