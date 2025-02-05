import express from 'express';
import admin from 'firebase-admin';
import fs from 'fs';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Initiarize Firebase Admin SDK
const serviceAccount = JSON.parse(fs.readFileSync('./config/serviceAccountKey.json', 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

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

// API: Fetch Driver history data
app.get('/driver-history', async (req, res) => {
  try {
    const historyRef = db.collection('driver-history'); // Firestore collection
    const snapshot = await historyRef.get();

    if (snapshot.empty) {
      return res.status(404).json({message: 'No driver history found'});
    }

    const historyData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(historyData);
  } catch (error) {
    console.error('Error fetching driver history:', error);
    res.status(500).json({message: 'Failed to fetch driver history', error: error.message});
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
