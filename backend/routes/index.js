/* eslint-disable import/extensions */
import admin from 'firebase-admin';

// eslint-disable-next-line import/no-extraneous-dependencies
import express from 'express';
import fs from 'fs';
import driverRoutes from './driverRoutes.js';
// import historyRoutes from './historyRoutes.js';
import invitationsRoutes from './invitationsRoutes.js';
import faceDetectionSessionRoutes from '../dist/faceDetectionSessionRoutes.js';
import companyRoutes from './companyRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();
// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(fs.readFileSync('./config/serviceAccountKey.json', 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();
const driverCollection = db.collection('driver');
// const historyCollection = db.collection('history');
const invitationsCollection = db.collection('invitations');
const companyCollection = db.collection('companies');
const faceDetectionSessionCollection = db.collection('face_detection_session');
const adminsCollection = db.collection('admins');

router.use('/drivers', driverRoutes(driverCollection));
// router.use('/history', historyRoutes(historyCollection, driverCollection, admin));
router.use('/invitations', invitationsRoutes(invitationsCollection, db));
router.use('/companies', companyRoutes(companyCollection));
router.use('/face-detection-session', faceDetectionSessionRoutes(faceDetectionSessionCollection));
router.use('/admins', adminRoutes(adminsCollection));

export default router;
