import express from 'express';
import admin from 'firebase-admin';

const faceDetectionSessionRoutes = faceDetectionSessionCollection => {
  const router = express.Router();
  router.post('/register', async (req, res) => {
    try {
      const {faceDetectionSessionId, userId, startTime, endTime, sessionDuration, alerts} =
        req.body;
      // Validation
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({error: 'Invalid parameter.'});
      }
      if (!startTime || typeof startTime !== 'string') {
        return res.status(400).json({error: 'Invalid parameter.'});
      }
      if (!endTime || typeof endTime !== 'string') {
        return res.status(400).json({error: 'Invalid parameter.'});
      }
      if (typeof sessionDuration !== 'number' || sessionDuration <= 0) {
        return res.status(400).json({error: 'Invalid parameter.'});
      }
      // Convert to Firestore Timestamp
      const startTimestamp = admin.firestore.Timestamp.fromDate(new Date(startTime));
      const endTimestamp = admin.firestore.Timestamp.fromDate(new Date(endTime));
      const alertsTimestamp = alerts
        ? alerts.map(alert => admin.firestore.Timestamp.fromDate(new Date(alert)))
        : [];
      const sessionData = {
        faceDetectionSessionId,
        userId,
        startTime: startTimestamp,
        endTime: endTimestamp,
        sessionDuration,
        alerts: alertsTimestamp,
      };
      const docRef = await faceDetectionSessionCollection.add(sessionData);
      console.log('Facedetection Session registered:', docRef.id);
      res.status(201).json({message: 'Session registered successfully', sessionId: docRef.id});
    } catch (error) {
      console.error('Error registering session:', error);
      res.status(500).json({error: `Failed to register session: ${error}`});
    }
  });
  // GET: /daily?userId=xxx&date=YYYY-MM-DD
  router.get('/daily', async (req, res) => {
    try {
      const {userId, date} = req.query;
      if (!userId || !date || typeof userId !== 'string' || typeof date !== 'string') {
        return res.status(400).json({error: 'Invalid parameter.'});
      }
      const startOfDay = new Date(`${date}T00:00:00`);
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
      // Convert to Firestore Timestamp
      const startOfDayTimestamp = admin.firestore.Timestamp.fromDate(startOfDay);
      const endOfDayTimestamp = admin.firestore.Timestamp.fromDate(endOfDay);
      const querySnapshot = await faceDetectionSessionCollection
        .where('userId', '==', userId)
        .where('startTime', '>=', startOfDayTimestamp)
        .where('startTime', '<=', endOfDayTimestamp)
        .get();
      let totalSessionHours = 0;
      let totalNumberOfAlert = 0;
      const result = {};
      querySnapshot.forEach(doc => {
        const session = doc.data();
        const sessionStart = session.startTime.toDate();
        const sessionEnd = new Date(sessionStart.getTime() + session.sessionDuration * 1000);
        sessionStart.setMilliseconds(0);
        sessionEnd.setMilliseconds(0);
        const currentTime = new Date(sessionStart);
        let currentHour = currentTime.getHours();
        let remainingDuration = session.sessionDuration / 3600;
        // Allocate session duration to each hour
        while (remainingDuration > 0) {
          const nextHour = new Date(currentTime);
          nextHour.setHours(currentHour + 1, 0, 0, 0);
          const EndTime = Math.min(nextHour.getTime(), sessionEnd.getTime());
          const Duration = (EndTime - currentTime.getTime()) / 3600000;
          if (!result[currentHour]) {
            result[currentHour] = {totalSessionHours: 0, totalNumberOfAlert: 0};
          }
          result[currentHour].totalSessionHours += Duration;
          totalSessionHours += Duration;
          remainingDuration -= Duration;
          currentTime.setHours(currentHour + 1, 0, 0, 0);
          currentHour = currentTime.getHours();
        }
        // Allocate alerts to each hour
        session.alerts?.forEach(alert => {
          const alertTime = alert.toDate();
          const alertHour = alertTime.getHours();
          result[alertHour].totalNumberOfAlert += 1;
          totalNumberOfAlert += 1;
        });
      });
      // console.log('result:', result);
      const dayHours = Array.from({length: 24}, (_, i) => {
        const hour = String(i).padStart(2, '0');
        return `${date} ${hour}:00`;
      });
      const processedData = dayHours.map((dateTime, i) => {
        const hourlyData = result[i] || {totalSessionHours: 0, totalNumberOfAlert: 0};
        const alertsPerHour =
          hourlyData.totalSessionHours > 0
            ? hourlyData.totalNumberOfAlert / hourlyData.totalSessionHours
            : 0;
        return {
          date: dateTime,
          totalSessionHours: parseFloat(hourlyData.totalSessionHours.toFixed(2)),
          totalNumberOfAlert: hourlyData.totalNumberOfAlert,
          alertPerHour: parseFloat(alertsPerHour.toFixed(2)),
        };
      });
      res.json({
        totalSessionHours: parseFloat(totalSessionHours.toFixed(2)),
        totalNumberOfAlert,
        data: processedData,
      });
    } catch (error) {
      console.error('Error fetching daily data:', error);
      res.status(500).json({error: `Failed to fetch daily history records: ${error}`});
    }
  });
  // GET: /weekly?userId=xxx&date=YYYY-MM-DD
  router.get('/weekly', async (req, res) => {
    try {
      // TODO: userID needs to be retrieved from JWT.
      const {userId, date} = req.query;
      if (!userId || !date || typeof userId !== 'string' || typeof date !== 'string') {
        return res.status(400).json({error: 'Invalid parameter.'});
      }
      const startOfDay = new Date(`${date}T00:00:00`);
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      const startOfWeekTimestamp = admin.firestore.Timestamp.fromDate(startOfWeek);
      const endOfWeekTimestamp = admin.firestore.Timestamp.fromDate(endOfWeek);
      const querySnapshot = await faceDetectionSessionCollection
        .where('userId', '==', userId)
        .where('startTime', '>=', startOfWeekTimestamp)
        .where('startTime', '<=', endOfWeekTimestamp)
        .get();
      let totalSessionHours = 0;
      let totalNumberOfAlert = 0;
      const result = {};
      // Allocate session duration and alert to each day
      querySnapshot.forEach(doc => {
        const session = doc.data();
        const sessionStart = session.startTime.toDate();
        const sessionDateString = sessionStart.toLocaleDateString('en-CA');
        if (!result[sessionDateString]) {
          result[sessionDateString] = {totalSessionHours: 0, totalNumberOfAlert: 0};
        }
        const sessionHours = session.sessionDuration / 3600;
        const alertCount = session.alerts?.length || 0;
        result[sessionDateString].totalSessionHours += sessionHours;
        result[sessionDateString].totalNumberOfAlert += alertCount;
        totalSessionHours += sessionHours;
        totalNumberOfAlert += alertCount;
      });
      // console.log('result:', result);
      const weekDates = Array.from({length: 7}, (_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        return day.toLocaleDateString('en-CA');
      });
      const processedData = weekDates.map(day => {
        const dailyData = result[day] || {totalSessionHours: 0, totalNumberOfAlert: 0};
        const alertsPerHour =
          dailyData.totalSessionHours > 0
            ? dailyData.totalNumberOfAlert / dailyData.totalSessionHours
            : 0;
        return {
          date: day,
          totalSessionHours: parseFloat(dailyData.totalSessionHours.toFixed(2)),
          totalNumberOfAlert: dailyData.totalNumberOfAlert,
          alertPerHour: parseFloat(alertsPerHour.toFixed(2)),
        };
      });
      res.json({
        totalSessionHours: parseFloat(totalSessionHours.toFixed(2)),
        totalNumberOfAlert,
        data: processedData,
      });
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      res.status(500).json({error: `Failed to fetch weekly history records: ${error}`});
    }
  });
  // GET: /monthly?userId=xxx&date=YYYY-MM-DD
  router.get('/monthly', async (req, res) => {
    try {
      // TODO: userID needs to be retrieved from JWT.
      const {userId, date} = req.query;
      if (!userId || !date || typeof userId !== 'string' || typeof date !== 'string') {
        return res.status(400).json({error: 'Invalid parameter.'});
      }
      const [year, month] = date.split('-');
      if (!year || !month) {
        return res.status(400).json({error: 'Invalid parameter.'});
      }
      const startOfMonth = new Date(`${year}-${month}-01T00:00:00`);
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(startOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);
      const startOfMonthTimestamp = admin.firestore.Timestamp.fromDate(startOfMonth);
      const endOfMonthTimestamp = admin.firestore.Timestamp.fromDate(endOfMonth);
      const querySnapshot = await faceDetectionSessionCollection
        .where('userId', '==', userId)
        .where('startTime', '>=', startOfMonthTimestamp)
        .where('startTime', '<=', endOfMonthTimestamp)
        .get();
      let totalSessionHours = 0;
      let totalNumberOfAlert = 0;
      const result = {};
      // Allocate session duration and alert to each day
      querySnapshot.forEach(doc => {
        const session = doc.data();
        const sessionStart = session.startTime.toDate();
        const sessionDateString = sessionStart.toLocaleDateString('en-CA');
        if (!result[sessionDateString]) {
          result[sessionDateString] = {totalSessionHours: 0, totalNumberOfAlert: 0};
        }
        const sessionHours = session.sessionDuration / 3600;
        const alertCount = session.alerts?.length || 0;
        result[sessionDateString].totalSessionHours += sessionHours;
        result[sessionDateString].totalNumberOfAlert += alertCount;
        totalSessionHours += sessionHours;
        totalNumberOfAlert += alertCount;
      });
      // console.log('result:', result);
      const daysInMonth = new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate();
      const monthDates = Array.from({length: daysInMonth}, (_, i) => {
        const day = new Date(startOfMonth);
        day.setDate(i + 1);
        return day.toLocaleDateString('en-CA');
      });
      const processedData = monthDates.map(day => {
        const dailyData = result[day] || {totalSessionHours: 0, totalNumberOfAlert: 0};
        const alertsPerHour =
          dailyData.totalSessionHours > 0
            ? dailyData.totalNumberOfAlert / dailyData.totalSessionHours
            : 0;
        return {
          date: day,
          totalSessionHours: parseFloat(dailyData.totalSessionHours.toFixed(2)),
          totalNumberOfAlert: dailyData.totalNumberOfAlert,
          alertPerHour: parseFloat(alertsPerHour.toFixed(2)),
        };
      });
      res.json({
        totalSessionHours: parseFloat(totalSessionHours.toFixed(2)),
        totalNumberOfAlert,
        data: processedData,
      });
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      res.status(500).json({error: `Failed to fetch history records: ${error}`});
    }
  });
  // GET: /yearly?userId=xxx&date=YYYY-MM-DD
  router.get('/yearly', async (req, res) => {
    try {
      // TODO: userID needs to be retrieved from JWT.
      const {userId, date} = req.query;
      if (!userId || !date || typeof userId !== 'string' || typeof date !== 'string') {
        return res.status(400).json({error: 'Invalid parameter.'});
      }
      const year = parseInt(date, 10);
      if (Number.isNaN(year)) {
        return res.status(400).json({error: 'Invalid parameter.'});
      }
      const startOfYear = new Date(`${year}-01-01T00:00:00`);
      const endOfYear = new Date(startOfYear);
      endOfYear.setFullYear(startOfYear.getFullYear() + 1);
      endOfYear.setDate(0);
      endOfYear.setHours(23, 59, 59, 999);
      const startOfYearTimestamp = admin.firestore.Timestamp.fromDate(startOfYear);
      const endOfYearTimestamp = admin.firestore.Timestamp.fromDate(endOfYear);
      const querySnapshot = await faceDetectionSessionCollection
        .where('userId', '==', userId)
        .where('startTime', '>=', startOfYearTimestamp)
        .where('startTime', '<=', endOfYearTimestamp)
        .get();
      let totalSessionHours = 0;
      let totalNumberOfAlert = 0;
      const result = {};
      // Allocate session duration and alert to each month
      querySnapshot.forEach(doc => {
        const session = doc.data();
        const sessionStart = session.startTime.toDate();
        const sessionMonthString = sessionStart.toLocaleDateString('en-CA', {
          year: 'numeric',
          month: '2-digit',
        });
        if (!result[sessionMonthString]) {
          result[sessionMonthString] = {totalSessionHours: 0, totalNumberOfAlert: 0};
        }
        const sessionHours = session.sessionDuration / 3600;
        const alertCount = session.alerts?.length || 0;
        result[sessionMonthString].totalSessionHours += sessionHours;
        result[sessionMonthString].totalNumberOfAlert += alertCount;
        totalSessionHours += sessionHours;
        totalNumberOfAlert += alertCount;
      });
      // console.log('result:', result);
      const yearMonths = Array.from({length: 12}, (_, i) => {
        const month = String(i + 1).padStart(2, '0');
        return `${year}-${month}`;
      });
      const processedData = yearMonths.map(month => {
        const monthlyData = result[month] || {totalSessionHours: 0, totalNumberOfAlert: 0};
        const alertsPerHour =
          monthlyData.totalSessionHours > 0
            ? monthlyData.totalNumberOfAlert / monthlyData.totalSessionHours
            : 0;
        return {
          date: month,
          totalSessionHours: parseFloat(monthlyData.totalSessionHours.toFixed(2)),
          totalNumberOfAlert: monthlyData.totalNumberOfAlert,
          alertPerHour: parseFloat(alertsPerHour.toFixed(2)),
        };
      });
      res.json({
        totalSessionHours: parseFloat(totalSessionHours.toFixed(2)),
        totalNumberOfAlert,
        data: processedData,
      });
    } catch (error) {
      console.error('Error fetching yearly data:', error);
      res.status(500).json({error: `Failed to fetch yearly history records: ${error}`});
    }
  });
  return router;
};
export default faceDetectionSessionRoutes;
