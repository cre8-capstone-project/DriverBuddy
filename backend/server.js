/* eslint-disable import/extensions */
import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import fs from 'fs';
import driverRoutes from './routes/driverRoutes.js';
import invitationsRoutes from './routes/invitationsRoutes.js';

// import historyRoutes from './routes/historyRoutes.js';
import faceDetectionSessionRoutes from './dist/faceDetectionSessionRoutes.js'; // Need to be revised later
// import faceDetectionSessionRoutes from './routes/faceDetectionSessionRoutes.ts';

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(fs.readFileSync('./config/serviceAccountKey.json', 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const driverCollection = db.collection('driver');
// const historyCollection = db.collection('history');
const faceDetectionSessionCollection = db.collection('face_detection_session');
const invitationsCollection = db.collection('invitations');

const app = express();
app.use(express.json());
app.use(cors({origin: '*', credentials: false}));

const PORT = 3000;

// Root end point
app.get('/', (req, res) => {
  res.send('Welcome to DriveBuddy!');
});

app.use('/drivers', driverRoutes(driverCollection));
// app.use('/history', historyRoutes(historyCollection, driverCollection, admin));
app.use('/face-detection-session', faceDetectionSessionRoutes(faceDetectionSessionCollection));
app.use('/invitations', invitationsRoutes(invitationsCollection));

app.listen(PORT, '0.0.0.0', () => console.log(`Server is running on port ${PORT}`));
