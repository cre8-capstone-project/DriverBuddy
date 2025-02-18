import axios, {AxiosResponse} from 'axios';

// Common setting for API requests
const axiosClient = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://10.0.0.23:3000', // replace 10.0.0.23 with your own IP
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define types for driver and history records
interface Driver {
  id?: string;
  name: string;
  email: string;
  phone: string;
}

interface History {
  id?: string;
  numberOfAlerts: number;
  startingPointName: string;
  startingPointCoordinates: string;
  destinationName: string;
  destinationCoordinates: string;
  distanceInKm: number;
  driverID: string;
  durationInMinutes: number;
}
/**
 * Retrieves a driver by their ID.
 * @param id - The ID of the driver.
 * @returns The driver object or undefined if an error occurs.
 */
const getDriverByID = async (id: string) => {
  try {
    const response: AxiosResponse<Driver> = await axiosClient.get(`/drivers/${id}`, {
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Retrieves all drivers from the database.
 * @returns An array of drivers or an empty array if an error occurs.
 */
const getAllDrivers = async (): Promise<Driver[]> => {
  try {
    const response = await axiosClient.get<Driver[]>('/drivers');
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

/**
 * Creates a new driver in the database.
 * @param driverObject - The driver data excluding the ID.
 * @returns The created driver object or undefined if an error occurs.
 */
const createDriver = async (driverObject: Omit<Driver, 'id'>): Promise<Driver | undefined> => {
  try {
    const response = await axiosClient.post<Driver>('/drivers', driverObject);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Updates an existing driver by ID.
 * @param driverId - The ID of the driver to update.
 * @param driverObject - The updated driver data.
 * @returns The updated driver object or undefined if an error occurs.
 */
const updateDriver = async (
  driverId: string,
  driverObject: Partial<Driver>,
): Promise<Driver | undefined> => {
  try {
    const response = await axiosClient.put<Driver>(`/drivers/${driverId}`, driverObject);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Deletes a driver by their ID.
 * @param driverId - The ID of the driver to delete.
 * @returns A success message or undefined if an error occurs.
 */
const deleteDriver = async (driverId: string): Promise<{message: string} | undefined> => {
  try {
    const response = await axiosClient.delete<{message: string}>(`/drivers/${driverId}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Retrieves a history record by its ID.
 * @param historyId - The ID of the history record.
 * @returns The history object or undefined if an error occurs.
 */
const getHistoryByID = async (historyId: string): Promise<History | undefined> => {
  try {
    const response = await axiosClient.get<History>(`/history/${historyId}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Creates a new history record for a driver.
 * @param historyObject - The history data excluding the ID.
 * @returns The created history object or undefined if an error occurs.
 */
const createHistoryByDriverID = async (
  historyObject: Omit<History, 'id'>,
): Promise<History | undefined> => {
  try {
    const response = await axiosClient.post<History>('/history', historyObject);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Updates an existing history record by ID.
 * @param historyId - The ID of the history record to update.
 * @param updateObject - The updated history data.
 * @returns The updated history object or undefined if an error occurs.
 */
const updateHistoryByID = async (
  historyId: string,
  updateObject: Partial<History>,
): Promise<History | undefined> => {
  try {
    const response = await axiosClient.put<History>(`/history/${historyId}`, updateObject);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Deletes a history record by its ID.
 * @param historyId - The ID of the history record to delete.
 * @returns A success message or undefined if an error occurs.
 */
const deleteHistoryByID = async (historyId: string): Promise<{message: string} | undefined> => {
  try {
    const response = await axiosClient.delete<{message: string}>(`/history/${historyId}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Retrieves all history records for a specific driver.
 * @param driverId - The ID of the driver.
 * @returns An array of history records or an empty array if an error occurs.
 */
const getAllHistoryFromDriver = async (driverId: string): Promise<History[]> => {
  try {
    const response = await axiosClient.get<History[]>(`/history/driver/${driverId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};
export {
  getDriverByID,
  getAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  getHistoryByID,
  createHistoryByDriverID,
  updateHistoryByID,
  deleteHistoryByID,
  getAllHistoryFromDriver,
};
