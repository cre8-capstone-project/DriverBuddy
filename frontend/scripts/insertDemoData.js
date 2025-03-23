const demoData = require('./json_v2/bWXJHteDXkYZkPipb7Rdu34JwG56_modified.json');
const axios = require('axios');

// Ensure demoData is an array
if (!Array.isArray(demoData)) {
  throw new Error('demoData is not an array');
}

const insertDemoData = async () => {
  for (const sessionData of demoData) {
    const {faceDetectionSessionId, userId, startTime, endTime, alerts} = sessionData;

    const session = {
      faceDetectionSessionId,
      userId,
      startTime,
      endTime,
      sessionDuration: (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000,
      alerts,
    };
    console.log('Inserting session:', session);

    try {
      const response = await axios.post(
        'http://localhost:3000/face-detection-session/register',
        session,
      );
      if (response.data) {
        console.log(
          `Session ${faceDetectionSessionId} successfully registered to the cloud database:`,
          response.data,
        );
      } else {
        console.error(
          `Failed to register session ${faceDetectionSessionId} to the cloud database.`,
        );
      }
    } catch (error) {
      console.error(
        `An error occurred while registering session ${faceDetectionSessionId}:`,
        error,
      );
    }
  }
};

insertDemoData();
