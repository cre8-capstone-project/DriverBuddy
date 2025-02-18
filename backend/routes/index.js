/* eslint-disable import/extensions */
import admin from 'firebase-admin';
import express from 'express';
import fs from 'fs';
import driverRoutes from './driverRoutes.js';
import historyRoutes from './historyRoutes.js';

const router = express.Router();
// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(fs.readFileSync('./config/serviceAccountKey.json', 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const driverCollection = db.collection('driver');
const historyCollection = db.collection('history');

router.use('/drivers', driverRoutes(driverCollection));
router.use('/history', historyRoutes(historyCollection, driverCollection, admin));

export default router;
