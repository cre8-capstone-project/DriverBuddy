const axios = require('axios');

const userIdToDelete = 'ZBjov5PGgJNqZjWlqJqkAEaILpJ2'; // Replace with the userId you want to delete
//tPWXJfeDXkYZkPipb7Rdu96JwN42
//ZBjov5PGgJNqZjWlqJqkAEaILpJ2

const API_URL = `http://localhost:3000/face-detection-session/delete/${userIdToDelete}`;

const deleteUserData = async () => {
  try {
    console.log(`Sending DELETE request to ${API_URL}...`);

    const response = await axios.delete(API_URL);

    if (response.status === 200) {
      console.log(`All sessions for userId ${userIdToDelete} have been deleted successfully.`);
      console.log(response.data);
    } else {
      console.error(`Failed to delete sessions for userId ${userIdToDelete}.`);
    }
  } catch (error) {
    console.error(
      `An error occurred while deleting sessions for userId ${userIdToDelete}:`,
      error.response ? error.response.data : error.message,
    );
  }
};

deleteUserData();
