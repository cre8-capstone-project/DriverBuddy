import {drizzleDb} from '@/db/db';
import {settings, restStopTypes} from '@/db/schema';
import type {SettingsType, RestStopsType} from '@/types/SettingsType';
import {eq} from 'drizzle-orm';

// 🚀 Create or Update Settings
export const upsertSettings = async (data: Omit<SettingsType, 'id'>) => {
  try {
    // Check if settings exist
    const existingSettings = await drizzleDb.select().from(settings).limit(1);

    if (existingSettings.length > 0) {
      // Update existing settings
      await drizzleDb.update(settings).set(data).where(eq(settings.id, existingSettings[0].id));
      return {success: true, message: 'Settings updated successfully'};
    } else {
      // Insert new settings
      await drizzleDb.insert(settings).values(data);
      return {success: true, message: 'Settings created successfully'};
    }
  } catch (error) {
    console.error('Error upserting settings:', error);
    return {success: false, message: 'Failed to upsert settings'};
  }
};

// 🚀 Retrieve Settings
export const getSettings = async (): Promise<(SettingsType & {restStopTypes: number[]}) | null> => {
  try {
    // Fetch settings
    const result = await drizzleDb.select().from(settings).limit(1);

    if (result.length === 0) return null;

    const settingsData = result[0];

    // Fetch associated rest stop types
    const restStops = await drizzleDb
      .select({stopType: restStopTypes.stopType})
      .from(restStopTypes)
      .where(eq(restStopTypes.settingsId, settingsData.id));

    const restStopTypesArray = restStops.map(item => item.stopType);

    return {
      ...settingsData,
      restStopTypes: restStopTypesArray,
    };
  } catch (error) {
    console.error('Error fetching settings with rest stop types:', error);
    return null;
  }
};

// 🚀 Add Rest Stop Type
export const addRestStopType = async (settingsId: number, stopType: number) => {
  try {
    await drizzleDb.insert(restStopTypes).values({settingsId, stopType});
    return {success: true, message: 'Rest stop type added successfully'};
  } catch (error) {
    console.error('Error adding rest stop type:', error);
    return {success: false, message: 'Failed to add rest stop type'};
  }
};

// 🚀 Retrieve Rest Stop Types for Settings
export const getRestStopTypes = async (settingsId: number): Promise<RestStopsType[]> => {
  try {
    return await drizzleDb
      .select()
      .from(restStopTypes)
      .where(eq(restStopTypes.settingsId, settingsId));
  } catch (error) {
    console.error('Error fetching rest stop types:', error);
    return [];
  }
};

// 🚀 Delete Rest Stop Type
export const deleteRestStopType = async (id: number) => {
  try {
    await drizzleDb.delete(restStopTypes).where(eq(restStopTypes.id, id));
    return {success: true, message: 'Rest stop type deleted successfully'};
  } catch (error) {
    console.error('Error deleting rest stop type:', error);
    return {success: false, message: 'Failed to delete rest stop type'};
  }
};
