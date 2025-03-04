import axios, {AxiosResponse} from 'axios';
import {Timestamp} from 'firebase/firestore';
import type {FDSessionType} from '../types/FDSessionType';
import type {FDSessionHistoryType} from '../types/FDSessionType';
import type {InvitationCodeType} from '../types/InvitationCodeType';

//const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.128.242.200:3000'; // replace with your own IP
const API_URL = 'http://10.0.0.23:3000'; // replace with your own IP
// Common setting for API requests
const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define types for driver and history records
interface Driver {
  id?: string;
  user_type?: string;
  name: string;
  email: string;
  phone: string;
  vehicle_type?: string;
  birthday: Timestamp;
  picture_url: string;
}
interface InvitationCode {
  id?: string;
  user_type?: string;
  name: string;
  email: string;
  phone: string;
  vehicle_type?: string;
  birthday: Timestamp;
  picture_url: string;
}
// interface History {
//   id?: string;
//   numberOfAlerts: number;
//   startingPointName: string;
//   startingPointCoordinates: string;
//   destinationName: string;
//   destinationCoordinates: string;
//   distanceInKm: number;
//   driverID: string;
//   durationInMinutes: number;
// }

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
    return {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      phone: response.data.phone,
      user_type: response.data.user_type,
      vehicle_type: response.data.vehicle_type,
      birthday: response.data.birthday
        ? new Date(response.data.birthday.seconds * 1000) // Convert Firestore Timestamp to Date
        : null,
      picture_url: response.data.picture_url,
    };
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
const createDriver = async (driverObject: Driver): Promise<Driver | undefined> => {
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
const updateDriver = async (driverId: string, driverObject: Partial<Driver>) => {
  try {
    const response = await axiosClient.put<Driver>(`/drivers/${driverId}`, driverObject);
    return {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      phone: response.data.phone,
      user_type: response.data.user_type,
      vehicle_type: response.data.vehicle_type,
      birthday: response.data.birthday
        ? new Date(response.data.birthday.seconds * 1000) // Convert Firestore Timestamp to Date
        : null,
      picture_url: response.data.picture_url,
    };
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
// const getHistoryByID = async (historyId: string): Promise<History | undefined> => {
//   try {
//     const response = await axiosClient.get<History>(`/history/${historyId}`);
//     return response.data;
//   } catch (error) {
//     console.error(error);
//   }
// };

/**
 * Creates a new history record for a driver.
 * @param historyObject - The history data excluding the ID.
 * @returns The created history object or undefined if an error occurs.
 */
// const createHistoryByDriverID = async (
//   historyObject: Omit<History, 'id'>,
// ): Promise<History | undefined> => {
//   try {
//     const response = await axiosClient.post<History>('/history', historyObject);
//     return response.data;
//   } catch (error) {
//     console.error(error);
//   }
// };

/**
 * Updates an existing history record by ID.
 * @param historyId - The ID of the history record to update.
 * @param updateObject - The updated history data.
 * @returns The updated history object or undefined if an error occurs.
 */
// const updateHistoryByID = async (
//   historyId: string,
//   updateObject: Partial<History>,
// ): Promise<History | undefined> => {
//   try {
//     const response = await axiosClient.put<History>(`/history/${historyId}`, updateObject);
//     return response.data;
//   } catch (error) {
//     console.error(error);
//   }
// };

/**
 * Deletes a history record by its ID.
 * @param historyId - The ID of the history record to delete.
 * @returns A success message or undefined if an error occurs.
 */
// const deleteHistoryByID = async (historyId: string): Promise<{message: string} | undefined> => {
//   try {
//     const response = await axiosClient.delete<{message: string}>(`/history/${historyId}`);
//     return response.data;
//   } catch (error) {
//     console.error(error);
//   }
// };

/**
 * Retrieves all history records for a specific driver.
 * @param driverId - The ID of the driver.
 * @returns An array of history records or an empty array if an error occurs.
 */
// const getAllHistoryFromDriver = async (driverId: string): Promise<History[]> => {
//   try {
//     const response = await axiosClient.get<History[]>(`/history/driver/${driverId}`);
//     return response.data;
//   } catch (error) {
//     console.error(error);
//     return [];
//   }
// };

//ToDo: Plan to do refactoring in the next sprint
const logFaceDetectionSessionData = async (
  sessionData: FDSessionType,
): Promise<{message: string; sessionId: string} | null> => {
  try {
    const response = await axiosClient.post<{message: string; sessionId: string}>(
      '/face-detection-session/register',
      sessionData,
    );
    return response.data;
  } catch (error) {
    console.error('Error logging face detection session:', error);
    return null;
  }
};

// ToDo: Plan to do refactoring in the next sprint
const getFaceDetectionHistoryDataByDay = async (
  driverId: string,
  date: string,
): Promise<FDSessionHistoryType> => {
  try {
    const response = await axiosClient.get<FDSessionHistoryType>(
      `/face-detection-session/daily/?userId=${driverId}&date=${date}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return {} as FDSessionHistoryType;
  }
};

// ToDo: Plan to do refactoring in the next sprint
const getFaceDetectionHistoryDataByWeek = async (
  driverId: string,
  date: string,
): Promise<FDSessionHistoryType> => {
  try {
    const response = await axiosClient.get<FDSessionHistoryType>(
      `/face-detection-session/weekly/?userId=${driverId}&date=${date}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return {} as FDSessionHistoryType;
  }
};

// ToDo: Plan to do refactoring in the next sprint
const getFaceDetectionHistoryDataByMonth = async (
  driverId: string,
  date: string,
): Promise<FDSessionHistoryType> => {
  try {
    const response = await axiosClient.get<FDSessionHistoryType>(
      `/face-detection-session/monthly/?userId=${driverId}&date=${date}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return {} as FDSessionHistoryType;
  }
};

// ToDo: Plan to do refactoring in the next sprint
const getFaceDetectionHistoryDataByYear = async (
  driverId: string,
  date: string,
): Promise<FDSessionHistoryType> => {
  try {
    const response = await axiosClient.get<FDSessionHistoryType>(
      `/face-detection-session/yearly/?userId=${driverId}&date=${date}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return {} as FDSessionHistoryType;
  }
};

const getInvitationCode = async (code: string): Promise<InvitationCodeType | null> => {
  try {
    const response = await axiosClient.get<InvitationCodeType>(`/invitations/${code}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle Axios-specific errors
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.error('Error response:', error.response.data);

        // You can handle specific status codes if needed
        if (error.response.status === 404) {
          console.error('Invitation not found');
        }

        throw new Error(error.response.data.error || 'Error retrieving invitation');
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', error.message);
        throw new Error(`Request failed: ${error.message}`);
      }
    } else {
      // Handle non-Axios errors
      console.error('Unexpected error:', error);
      throw new Error('An unexpected error occurred');
    }
  }
};

const updateInvitationStatus = async (
  updatedInvitationObj: InvitationCodeType,
): Promise<InvitationCodeType> => {
  try {
    const response = await axiosClient.put<InvitationCodeType>(
      `/invitations/${updatedInvitationObj.id}`,
      updatedInvitationObj,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle Axios-specific errors
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.error('Error response:', error.response.data);

        // You can handle specific status codes if needed
        if (error.response.status === 404) {
          console.error('Invitation not found');
        }

        throw new Error(error.response.data.error || 'Error retrieving invitation');
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        throw new Error('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', error.message);
        throw new Error(`Request failed: ${error.message}`);
      }
    } else {
      // Handle non-Axios errors
      console.error('Unexpected error:', error);
      throw new Error('An unexpected error occurred');
    }
  }
};

export {
  Driver,
  // History,
  getDriverByID,
  getAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  // getHistoryByID,
  // createHistoryByDriverID,
  // updateHistoryByID,
  // deleteHistoryByID,
  // getAllHistoryFromDriver,
  logFaceDetectionSessionData,
  getFaceDetectionHistoryDataByDay,
  getFaceDetectionHistoryDataByWeek,
  getFaceDetectionHistoryDataByMonth,
  getFaceDetectionHistoryDataByYear,
  getInvitationCode,
  updateInvitationStatus,
};
