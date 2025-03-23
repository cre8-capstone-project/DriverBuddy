const axios = require('axios');

const userIdToDelete = 'bWXJHteDXkYZkPipb7Rdu34JwG56'; // Replace with the userId you want to delete
// tPWXJfeDXkYZkPipb7Rdu96JwN42
// ZBjov5PGgJNqZjWlqJqkAEaILpJ2
// uKXJHgeDXkYZkPipb7Rdu12JwA24
// yPWXJteDXkYZkPipb7Rdu34JwB56
// wPXJHreDXkYZkPipb7Rdu56JwC78
// zQXJXueDXkYZkPipb7Rdu78JwD90
// tRWXJseDXkYZkPipb7Rdu90JwE12
// aLWXJueDXkYZkPipb7Rdu12JwF34
// bWXJHteDXkYZkPipb7Rdu34JwG56
// cQXJXreDXkYZkPipb7Rdu56JwH78
// dQWXJueDXkYZkPipb7Rdu78JwI90
// eQWXJseDXkYZkPipb7Rdu90JwJ12

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
