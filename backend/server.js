import express from 'express';
import admin from 'firebase-admin';
import fs from 'fs';
import cors from 'cors';

const app = express();
app.use(cors());

// Initiarize Firebase Admin SDK
const serviceAccount = JSON.parse(fs.readFileSync('./config/serviceAccountKey.json', 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Root end point
app.get('/', (req, res) => {
  res.send('Welcome to DriveBuddy!');
});

// Firebase End point for connecting test
app.get('/test-firebase', async (req, res) => {
  try {
    const userList = await admin.auth().listUsers(10);
    res.status(200).json({
      message: 'Firebase connected!',
      users: userList.users.map(user => user.email),
    });
  } catch (error) {
    console.error('Firebase connection error:', error);
    res.status(500).json({
      message: 'Firebase connection failed',
      error: error.message,
    });
  }
});

app.listen(3000, () => console.log('Backend server is running on port 3000.'));

// import express from 'express';

// const app = express();

// app.get('/', (req, res) => {
//   res.send('Welcome to DriveBuddy!');
// });

// app.listen(3000, () => console.log('Example app is listening on port 3000.'));

// import express from 'express';

// const app = express();

// app.get('/', (req, res) => {
//   res.send('Welcome to DriveBuddy!');
// });

// app.listen(3000, () => console.log('Example app is listening on port 3000.'));
