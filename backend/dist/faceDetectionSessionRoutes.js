import express from 'express';
import admin from 'firebase-admin';
import { fromZonedTime, toZonedTime } from 'date-fns-tz'; // eslint-disable-line import/no-extraneous-dependencies
const faceDetectionSessionRoutes = (faceDetectionSessionCollection) => {
    const router = express.Router();
    const timeZone = 'America/Vancouver';
    const getUserIdsByCompanyID = async (companyID) => {
        const usersSnapshot = await admin
            .firestore()
            .collection('driver')
            .where('company_id', '==', companyID)
            .get();
        return usersSnapshot.docs.map(doc => doc.id);
    };
    // POST: /face-detection-session/register
    router.post('/register', async (req, res) => {
        try {
            const { faceDetectionSessionId, userId, startTime, endTime, sessionDuration, alerts } = req.body;
            // Validation
            if (!userId || typeof userId !== 'string') {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            if (!startTime || typeof startTime !== 'string') {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            if (!endTime || typeof endTime !== 'string') {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            if (typeof sessionDuration !== 'number' || sessionDuration <= 0) {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            // Convert to Firestore Timestamp
            const startTimestamp = admin.firestore.Timestamp.fromDate(new Date(startTime));
            const endTimestamp = admin.firestore.Timestamp.fromDate(new Date(endTime));
            const alertsTimestamp = alerts
                ? alerts.map((alert) => admin.firestore.Timestamp.fromDate(new Date(alert)))
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
            res.status(201).json({ message: 'Session registered successfully', sessionId: docRef.id });
        }
        catch (error) {
            console.error('Error registering session:', error);
            res.status(500).json({ error: `Failed to register session: ${error}` });
        }
    });
    // GET: /face-detection-session/daily?userId=xxx&date=YYYY-MM-DD
    router.get('/daily', async (req, res) => {
        try {
            const { userId, date } = req.query;
            if (!userId || !date || typeof userId !== 'string' || typeof date !== 'string') {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const [year, month, day] = date.split('-');
            if (!year || !month || !day) {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const startOfDay = fromZonedTime(new Date(`${date}T00:00:00`), timeZone);
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
                    const localTime = toZonedTime(currentTime, timeZone);
                    const localHourString = localTime.getHours();
                    const nextHour = new Date(currentTime);
                    nextHour.setHours(currentHour + 1, 0, 0, 0);
                    const EndTime = Math.min(nextHour.getTime(), sessionEnd.getTime());
                    const Duration = (EndTime - currentTime.getTime()) / 3600000;
                    if (!result[localHourString]) {
                        result[localHourString] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                    }
                    result[localHourString].totalSessionHours += Duration;
                    totalSessionHours += Duration;
                    remainingDuration -= Duration;
                    currentTime.setHours(currentHour + 1, 0, 0, 0);
                    currentHour = currentTime.getHours();
                }
                // Allocate alerts to each hour
                session.alerts?.forEach(alert => {
                    const alertTime = alert.toDate();
                    const localAlertTime = toZonedTime(alertTime, timeZone);
                    const localAlertHourString = localAlertTime.getHours();
                    if (!result[localAlertHourString]) {
                        result[localAlertHourString] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                    }
                    result[localAlertHourString].totalNumberOfAlert += 1;
                    totalNumberOfAlert += 1;
                });
            });
            // console.log('result:', result);
            const dayHours = Array.from({ length: 24 }, (_, i) => {
                const hour = String(i).padStart(2, '0');
                return `${date} ${hour}:00`;
            });
            const processedData = dayHours.map((dateTime, i) => {
                const hourlyData = result[i] || { totalSessionHours: 0, totalNumberOfAlert: 0 };
                const alertsPerHour = hourlyData.totalSessionHours > 0
                    ? hourlyData.totalNumberOfAlert / hourlyData.totalSessionHours
                    : 0;
                return {
                    date: dateTime,
                    totalSessionHours: parseFloat(hourlyData.totalSessionHours.toFixed(2)),
                    totalNumberOfAlert: hourlyData.totalNumberOfAlert,
                    alertPerHour: parseFloat(alertsPerHour.toFixed(2)),
                };
            });
            // console.log('startOfDay:', startOfDay);
            // console.log('endOfDay:', endOfDay);
            // console.log('processedData:', processedData);
            res.json({
                totalSessionHours: parseFloat(totalSessionHours.toFixed(2)),
                totalNumberOfAlert,
                data: processedData,
            });
        }
        catch (error) {
            console.error('Error fetching daily data:', error);
            res.status(500).json({ error: `Failed to fetch daily history records: ${error}` });
        }
    });
    // GET: /face-detection-session/weekly?userId=xxx&date=YYYY-MM-DD
    router.get('/weekly', async (req, res) => {
        try {
            // TODO: userID needs to be retrieved from JWT.
            const { userId, date } = req.query;
            if (!userId || !date || typeof userId !== 'string' || typeof date !== 'string') {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const startOfDay = fromZonedTime(new Date(`${date}T00:00:00`), timeZone);
            const startOfWeek = new Date(startOfDay);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 7);
            endOfWeek.setSeconds(endOfWeek.getSeconds() - 1);
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
            querySnapshot.forEach(doc => {
                const session = doc.data();
                const sessionStart = session.startTime.toDate();
                const sessionEnd = new Date(sessionStart.getTime() + session.sessionDuration * 1000);
                sessionStart.setMilliseconds(0);
                sessionEnd.setMilliseconds(0);
                const currentTime = new Date(sessionStart);
                let remainingDuration = session.sessionDuration / 3600;
                // Allocate session duration to each day
                while (remainingDuration > 0) {
                    const localCurrentTime = toZonedTime(currentTime, timeZone);
                    const currentDateString = localCurrentTime.toLocaleDateString('en-CA');
                    const localNextDay = new Date(localCurrentTime);
                    localNextDay.setDate(localNextDay.getDate() + 1);
                    localNextDay.setHours(0, 0, 0, 0);
                    const nextDay = fromZonedTime(localNextDay, timeZone);
                    const EndTime = Math.min(nextDay.getTime(), sessionEnd.getTime());
                    const Duration = (EndTime - currentTime.getTime()) / 3600000; // calculated in hours
                    if (!result[currentDateString]) {
                        result[currentDateString] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                    }
                    result[currentDateString].totalSessionHours += Duration;
                    totalSessionHours += Duration;
                    remainingDuration -= Duration;
                    currentTime.setTime(EndTime);
                }
                // Allocate alerts to each hour
                session.alerts?.forEach(alert => {
                    const alertTime = alert.toDate();
                    const localAlertTime = toZonedTime(alertTime, timeZone);
                    const currentDateString = localAlertTime.toLocaleDateString('en-CA');
                    if (!result[currentDateString]) {
                        result[currentDateString] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                    }
                    result[currentDateString].totalNumberOfAlert += 1;
                    totalNumberOfAlert += 1;
                });
            });
            // console.log('result:', result);
            const weekDates = Array.from({ length: 7 }, (_, i) => {
                const day = new Date(startOfWeek);
                day.setDate(startOfWeek.getDate() + i);
                return day.toLocaleDateString('en-CA');
            });
            const processedData = weekDates.map(day => {
                const dailyData = result[day] || { totalSessionHours: 0, totalNumberOfAlert: 0 };
                const alertsPerHour = dailyData.totalSessionHours > 0
                    ? dailyData.totalNumberOfAlert / dailyData.totalSessionHours
                    : 0;
                return {
                    date: day,
                    totalSessionHours: parseFloat(dailyData.totalSessionHours.toFixed(2)),
                    totalNumberOfAlert: dailyData.totalNumberOfAlert,
                    alertPerHour: parseFloat(alertsPerHour.toFixed(2)),
                };
            });
            // console.log('startOfWeek:', startOfWeek);
            // console.log('endOfWeek:', endOfWeek);
            // console.log('processedData:', processedData);
            res.json({
                totalSessionHours: parseFloat(totalSessionHours.toFixed(2)),
                totalNumberOfAlert,
                data: processedData,
            });
        }
        catch (error) {
            console.error('Error fetching weekly data:', error);
            res.status(500).json({ error: `Failed to fetch weekly history records: ${error}` });
        }
    });
    // GET: /face-detection-session/monthly?userId=xxx&date=YYYY-MM
    router.get('/monthly', async (req, res) => {
        try {
            // TODO: userID needs to be retrieved from JWT.
            const { userId, date } = req.query;
            if (!userId || !date || typeof userId !== 'string' || typeof date !== 'string') {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const [year, month] = date.split('-');
            if (!year || !month) {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const startOfMonth = fromZonedTime(new Date(`${year}-${month}-01T00:00:00`), timeZone);
            const endOfMonth = new Date(startOfMonth);
            endOfMonth.setMonth(startOfMonth.getMonth() + 1);
            endOfMonth.setSeconds(endOfMonth.getSeconds() - 1);
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
            querySnapshot.forEach(doc => {
                const session = doc.data();
                const sessionStart = session.startTime.toDate();
                const sessionEnd = new Date(sessionStart.getTime() + session.sessionDuration * 1000);
                sessionStart.setMilliseconds(0);
                sessionEnd.setMilliseconds(0);
                const currentTime = new Date(sessionStart);
                let remainingDuration = session.sessionDuration / 3600;
                // Allocate session duration to each day
                while (remainingDuration > 0) {
                    const localCurrentTime = toZonedTime(currentTime, timeZone);
                    const currentDateString = localCurrentTime.toLocaleDateString('en-CA');
                    const localNextDay = new Date(localCurrentTime);
                    localNextDay.setDate(localNextDay.getDate() + 1);
                    localNextDay.setHours(0, 0, 0, 0);
                    const nextDay = fromZonedTime(localNextDay, timeZone);
                    const EndTime = Math.min(nextDay.getTime(), sessionEnd.getTime());
                    const Duration = (EndTime - currentTime.getTime()) / 3600000; // calculated in hours
                    if (!result[currentDateString]) {
                        result[currentDateString] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                    }
                    result[currentDateString].totalSessionHours += Duration;
                    totalSessionHours += Duration;
                    remainingDuration -= Duration;
                    currentTime.setTime(EndTime);
                }
                // Allocate alerts to each hour
                session.alerts?.forEach(alert => {
                    const alertTime = alert.toDate();
                    const localAlertTime = toZonedTime(alertTime, timeZone);
                    const currentDateString = localAlertTime.toLocaleDateString('en-CA');
                    if (!result[currentDateString]) {
                        result[currentDateString] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                    }
                    result[currentDateString].totalNumberOfAlert += 1;
                    totalNumberOfAlert += 1;
                });
            });
            // console.log('result:', result);
            const daysInMonth = new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate();
            const monthDates = Array.from({ length: daysInMonth }, (_, i) => {
                const day = new Date(startOfMonth);
                day.setDate(i + 1);
                return day.toLocaleDateString('en-CA');
            });
            const processedData = monthDates.map(day => {
                const dailyData = result[day] || { totalSessionHours: 0, totalNumberOfAlert: 0 };
                const alertsPerHour = dailyData.totalSessionHours > 0
                    ? dailyData.totalNumberOfAlert / dailyData.totalSessionHours
                    : 0;
                return {
                    date: day,
                    totalSessionHours: parseFloat(dailyData.totalSessionHours.toFixed(2)),
                    totalNumberOfAlert: dailyData.totalNumberOfAlert,
                    alertPerHour: parseFloat(alertsPerHour.toFixed(2)),
                };
            });
            // console.log('startOfMonth:', startOfMonth);
            // console.log('endOfMonth:', endOfMonth);
            // console.log('processedData:', processedData);
            res.json({
                totalSessionHours: parseFloat(totalSessionHours.toFixed(2)),
                totalNumberOfAlert,
                data: processedData,
            });
        }
        catch (error) {
            console.error('Error fetching monthly data:', error);
            res.status(500).json({ error: `Failed to fetch history records: ${error}` });
        }
    });
    // GET: /face-detection-session/yearly?userId=xxx&date=YYYY-MM-DD
    router.get('/yearly', async (req, res) => {
        try {
            // TODO: userID needs to be retrieved from JWT.
            const { userId, date } = req.query;
            if (!userId || !date || typeof userId !== 'string' || typeof date !== 'string') {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const year = parseInt(date, 10);
            if (Number.isNaN(year)) {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const startOfYear = fromZonedTime(new Date(`${year}-01-01T00:00:00`), timeZone);
            const endOfYear = new Date(startOfYear);
            endOfYear.setFullYear(startOfYear.getFullYear() + 1);
            endOfYear.setSeconds(endOfYear.getSeconds() - 1);
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
            querySnapshot.forEach(doc => {
                const session = doc.data();
                const sessionStart = session.startTime.toDate();
                const sessionEnd = new Date(sessionStart.getTime() + session.sessionDuration * 1000);
                sessionStart.setMilliseconds(0);
                sessionEnd.setMilliseconds(0);
                const currentTime = new Date(sessionStart);
                let remainingDuration = session.sessionDuration / 3600;
                // Allocate session duration to each day
                while (remainingDuration > 0) {
                    const localCurrentTime = toZonedTime(currentTime, timeZone);
                    const currentMonthString = localCurrentTime.toLocaleDateString('en-CA', {
                        year: 'numeric',
                        month: '2-digit',
                    });
                    const localNextDay = new Date(localCurrentTime);
                    localNextDay.setDate(localNextDay.getDate() + 1);
                    localNextDay.setHours(0, 0, 0, 0);
                    const nextDay = fromZonedTime(localNextDay, timeZone);
                    const EndTime = Math.min(nextDay.getTime(), sessionEnd.getTime());
                    const Duration = (EndTime - currentTime.getTime()) / 3600000; // calculated in hours
                    if (!result[currentMonthString]) {
                        result[currentMonthString] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                    }
                    result[currentMonthString].totalSessionHours += Duration;
                    totalSessionHours += Duration;
                    remainingDuration -= Duration;
                    currentTime.setTime(EndTime);
                }
                // Allocate alerts to each hour
                session.alerts?.forEach(alert => {
                    const alertTime = alert.toDate();
                    const localAlertTime = toZonedTime(alertTime, timeZone);
                    const alertMonthString = localAlertTime.toLocaleDateString('en-CA', {
                        year: 'numeric',
                        month: '2-digit',
                    });
                    if (!result[alertMonthString]) {
                        result[alertMonthString] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                    }
                    result[alertMonthString].totalNumberOfAlert += 1;
                    totalNumberOfAlert += 1;
                });
            });
            // console.log('result:', result);
            const yearMonths = Array.from({ length: 12 }, (_, i) => {
                const month = String(i + 1).padStart(2, '0');
                return `${year}-${month}`;
            });
            const processedData = yearMonths.map(month => {
                const monthlyData = result[month] || { totalSessionHours: 0, totalNumberOfAlert: 0 };
                const alertsPerHour = monthlyData.totalSessionHours > 0
                    ? monthlyData.totalNumberOfAlert / monthlyData.totalSessionHours
                    : 0;
                return {
                    date: month,
                    totalSessionHours: parseFloat(monthlyData.totalSessionHours.toFixed(2)),
                    totalNumberOfAlert: monthlyData.totalNumberOfAlert,
                    alertPerHour: parseFloat(alertsPerHour.toFixed(2)),
                };
            });
            // console.log('startOfYear:', startOfYear);
            // console.log('endOfYear:', endOfYear);
            // console.log('processedData:', processedData);
            res.json({
                totalSessionHours: parseFloat(totalSessionHours.toFixed(2)),
                totalNumberOfAlert,
                data: processedData,
            });
        }
        catch (error) {
            console.error('Error fetching yearly data:', error);
            res.status(500).json({ error: `Failed to fetch yearly history records: ${error}` });
        }
    });
    // GET: /face-detection-session/daily-summary?companyID=CCC&date=YYYY-MM-DD
    router.get('/daily-summary', async (req, res) => {
        try {
            const { date, companyID } = req.query;
            if (!date || typeof date !== 'string' || !companyID || typeof companyID !== 'string') {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const [year, month, day] = date.split('-');
            if (!year || !month || !day) {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const startOfDay = fromZonedTime(new Date(`${date}T00:00:00`), timeZone);
            const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
            const startOfDayTimestamp = admin.firestore.Timestamp.fromDate(startOfDay);
            const endOfDayTimestamp = admin.firestore.Timestamp.fromDate(endOfDay);
            const userIds = await getUserIdsByCompanyID(companyID);
            if (userIds.length === 0) {
                return res.json({
                    totalSessionHours: 0,
                    totalNumberOfAlert: 0,
                    alertPerHour: 0,
                    data: [],
                });
            }
            const querySnapshot = await faceDetectionSessionCollection
                .where('userId', 'in', userIds)
                .where('startTime', '>=', startOfDayTimestamp)
                .where('startTime', '<=', endOfDayTimestamp)
                .get();
            const result = {};
            querySnapshot.forEach(doc => {
                const session = doc.data();
                const sessionStart = session.startTime.toDate();
                const sessionEnd = new Date(sessionStart.getTime() + session.sessionDuration * 1000);
                sessionStart.setMilliseconds(0);
                sessionEnd.setMilliseconds(0);
                const currentTime = new Date(sessionStart);
                const EndTime = Math.min(endOfDay.getTime(), sessionEnd.getTime());
                const Duration = (EndTime - currentTime.getTime()) / 3600000; // calculated in hours
                if (!result[session.userId]) {
                    result[session.userId] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                }
                result[session.userId].totalSessionHours += Duration;
                session.alerts?.forEach(alert => {
                    const alertTime = alert.toDate();
                    if (alertTime > endOfDay)
                        return;
                    if (!result[session.userId]) {
                        result[session.userId] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                    }
                    result[session.userId].totalNumberOfAlert += 1;
                });
            });
            const processedData = userIds.map(userId => {
                const userResult = result[userId] || { totalSessionHours: 0, totalNumberOfAlert: 0 };
                const alertsPerHour = userResult.totalSessionHours > 0
                    ? userResult.totalNumberOfAlert / userResult.totalSessionHours
                    : 0;
                return {
                    userId,
                    totalSessionHours: parseFloat(userResult.totalSessionHours.toFixed(2)),
                    totalNumberOfAlert: userResult.totalNumberOfAlert,
                    alertPerHour: parseFloat(alertsPerHour.toFixed(2)),
                };
            });
            // console.log('startOfDay:', startOfDay);
            // console.log('endOfDay:', endOfDay);
            // console.log('processedData:', processedData);
            res.json({
                data: processedData,
            });
        }
        catch (error) {
            console.error('Error fetching daily summary data:', error);
            res.status(500).json({ error: `Failed to fetch daily summary records: ${error}` });
        }
    });
    // GET: /face-detection-session/weekly-summary?companyID=CCC&date=YYYY-MM-DD
    router.get('/weekly-summary', async (req, res) => {
        try {
            const { date, companyID } = req.query;
            if (!date || typeof date !== 'string' || !companyID || typeof companyID !== 'string') {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const startOfDay = fromZonedTime(new Date(`${date}T00:00:00`), timeZone);
            const startOfWeek = new Date(startOfDay);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 7);
            endOfWeek.setSeconds(endOfWeek.getSeconds() - 1);
            const startOfWeekTimestamp = admin.firestore.Timestamp.fromDate(startOfWeek);
            const endOfWeekTimestamp = admin.firestore.Timestamp.fromDate(endOfWeek);
            const userIds = await getUserIdsByCompanyID(companyID);
            if (userIds.length === 0) {
                return res.json({
                    totalSessionHours: 0,
                    totalNumberOfAlert: 0,
                    alertPerHour: 0,
                    data: [],
                });
            }
            const querySnapshot = await faceDetectionSessionCollection
                .where('userId', 'in', userIds)
                .where('startTime', '>=', startOfWeekTimestamp)
                .where('startTime', '<=', endOfWeekTimestamp)
                .get();
            const result = {};
            querySnapshot.forEach(doc => {
                const session = doc.data();
                const sessionStart = session.startTime.toDate();
                const sessionEnd = new Date(sessionStart.getTime() + session.sessionDuration * 1000);
                sessionStart.setMilliseconds(0);
                sessionEnd.setMilliseconds(0);
                const currentTime = new Date(sessionStart);
                const EndTime = Math.min(endOfWeek.getTime(), sessionEnd.getTime());
                const Duration = (EndTime - currentTime.getTime()) / 3600000; // calculated in hours
                if (!result[session.userId]) {
                    result[session.userId] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                }
                result[session.userId].totalSessionHours += Duration;
                session.alerts?.forEach(alert => {
                    const alertTime = alert.toDate();
                    if (alertTime > endOfWeek)
                        return;
                    if (!result[session.userId]) {
                        result[session.userId] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                    }
                    result[session.userId].totalNumberOfAlert += 1;
                });
            });
            // const processedData = Object.entries(result).map(([userId, userResult]) => {
            const processedData = userIds.map(userId => {
                const userResult = result[userId] || { totalSessionHours: 0, totalNumberOfAlert: 0 };
                const alertsPerHour = userResult.totalSessionHours > 0
                    ? userResult.totalNumberOfAlert / userResult.totalSessionHours
                    : 0;
                return {
                    userId,
                    totalSessionHours: parseFloat(userResult.totalSessionHours.toFixed(2)),
                    totalNumberOfAlert: userResult.totalNumberOfAlert,
                    alertPerHour: parseFloat(alertsPerHour.toFixed(2)),
                };
            });
            // console.log('startOfWeek:', startOfWeek);
            // console.log('endOfWeek:', endOfWeek);
            // console.log('processedData:', processedData);
            res.json({
                data: processedData,
            });
        }
        catch (error) {
            console.error('Error fetching weekly summary data:', error);
            res.status(500).json({ error: `Failed to fetch weekly summary records: ${error}` });
        }
    });
    router.get('/monthly-summary', async (req, res) => {
        try {
            const { date, companyID } = req.query;
            if (!date || typeof date !== 'string' || !companyID || typeof companyID !== 'string') {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const [year, month] = date.split('-');
            if (!year || !month) {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const startOfMonth = fromZonedTime(new Date(`${year}-${month}-01T00:00:00`), timeZone);
            const endOfMonth = new Date(startOfMonth);
            endOfMonth.setMonth(startOfMonth.getMonth() + 1);
            endOfMonth.setSeconds(endOfMonth.getSeconds() - 1);
            const startOfMonthTimestamp = admin.firestore.Timestamp.fromDate(startOfMonth);
            const endOfMonthTimestamp = admin.firestore.Timestamp.fromDate(endOfMonth);
            const userIds = await getUserIdsByCompanyID(companyID);
            if (userIds.length === 0) {
                return res.json({
                    totalSessionHours: 0,
                    totalNumberOfAlert: 0,
                    alertPerHour: 0,
                    data: [],
                });
            }
            const querySnapshot = await faceDetectionSessionCollection
                .where('userId', 'in', userIds)
                .where('startTime', '>=', startOfMonthTimestamp)
                .where('startTime', '<=', endOfMonthTimestamp)
                .get();
            const result = {};
            querySnapshot.forEach(doc => {
                const session = doc.data();
                const sessionStart = session.startTime.toDate();
                const sessionEnd = new Date(sessionStart.getTime() + session.sessionDuration * 1000);
                sessionStart.setMilliseconds(0);
                sessionEnd.setMilliseconds(0);
                const currentTime = new Date(sessionStart);
                const EndTime = Math.min(endOfMonth.getTime(), sessionEnd.getTime());
                const Duration = (EndTime - currentTime.getTime()) / 3600000; // calculated in hours
                if (!result[session.userId]) {
                    result[session.userId] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                }
                result[session.userId].totalSessionHours += Duration;
                session.alerts?.forEach(alert => {
                    const alertTime = alert.toDate();
                    if (alertTime > endOfMonth)
                        return;
                    if (!result[session.userId]) {
                        result[session.userId] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                    }
                    result[session.userId].totalNumberOfAlert += 1;
                });
            });
            const processedData = userIds.map(userId => {
                const userResult = result[userId] || { totalSessionHours: 0, totalNumberOfAlert: 0 };
                const alertsPerHour = userResult.totalSessionHours > 0
                    ? userResult.totalNumberOfAlert / userResult.totalSessionHours
                    : 0;
                return {
                    userId,
                    totalSessionHours: parseFloat(userResult.totalSessionHours.toFixed(2)),
                    totalNumberOfAlert: userResult.totalNumberOfAlert,
                    alertPerHour: parseFloat(alertsPerHour.toFixed(2)),
                };
            });
            // console.log('startOfMonth:', startOfMonth);
            // console.log('endOfMonth:', endOfMonth);
            // console.log('processedData:', processedData);
            res.json({
                data: processedData,
            });
        }
        catch (error) {
            console.error('Error fetching monthly summary data:', error);
            res.status(500).json({ error: `Failed to fetch monthly summary records: ${error}` });
        }
    });
    // GET: /face-detection-session/yearly-summary?companyID=CCC&date=YYYY
    router.get('/yearly-summary', async (req, res) => {
        try {
            const { date, companyID } = req.query;
            if (!date || typeof date !== 'string' || !companyID || typeof companyID !== 'string') {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const year = parseInt(date, 10);
            if (Number.isNaN(year)) {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const startOfYear = fromZonedTime(new Date(`${year}-01-01T00:00:00`), timeZone);
            const endOfYear = new Date(startOfYear);
            endOfYear.setFullYear(startOfYear.getFullYear() + 1);
            endOfYear.setSeconds(endOfYear.getSeconds() - 1);
            const startOfYearTimestamp = admin.firestore.Timestamp.fromDate(startOfYear);
            const endOfYearTimestamp = admin.firestore.Timestamp.fromDate(endOfYear);
            const userIds = await getUserIdsByCompanyID(companyID);
            if (userIds.length === 0) {
                return res.json({
                    totalSessionHours: 0,
                    totalNumberOfAlert: 0,
                    alertPerHour: 0,
                    data: [],
                });
            }
            const querySnapshot = await faceDetectionSessionCollection
                .where('userId', 'in', userIds)
                .where('startTime', '>=', startOfYearTimestamp)
                .where('startTime', '<=', endOfYearTimestamp)
                .get();
            const result = {};
            querySnapshot.forEach(doc => {
                const session = doc.data();
                const sessionStart = session.startTime.toDate();
                const sessionEnd = new Date(sessionStart.getTime() + session.sessionDuration * 1000);
                sessionStart.setMilliseconds(0);
                sessionEnd.setMilliseconds(0);
                const currentTime = new Date(sessionStart);
                const EndTime = Math.min(endOfYear.getTime(), sessionEnd.getTime());
                const Duration = (EndTime - currentTime.getTime()) / 3600000; // calculated in hours
                if (!result[session.userId]) {
                    result[session.userId] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                }
                result[session.userId].totalSessionHours += Duration;
                // Allocate alerts to each day
                session.alerts?.forEach(alert => {
                    const alertTime = alert.toDate();
                    if (alertTime > endOfYear)
                        return;
                    if (!result[session.userId]) {
                        result[session.userId] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                    }
                    result[session.userId].totalNumberOfAlert += 1;
                });
            });
            const processedData = userIds.map(userId => {
                const userResult = result[userId] || { totalSessionHours: 0, totalNumberOfAlert: 0 };
                const alertsPerHour = userResult.totalSessionHours > 0
                    ? userResult.totalNumberOfAlert / userResult.totalSessionHours
                    : 0;
                return {
                    userId,
                    totalSessionHours: parseFloat(userResult.totalSessionHours.toFixed(2)),
                    totalNumberOfAlert: userResult.totalNumberOfAlert,
                    alertPerHour: parseFloat(alertsPerHour.toFixed(2)),
                };
            });
            // console.log('startOfYear:', startOfYear);
            // console.log('endOfYear:', endOfYear);
            // console.log('processedData:', processedData);
            res.json({
                data: processedData,
            });
        }
        catch (error) {
            console.error('Error fetching yearly summary data:', error);
            res.status(500).json({ error: `Failed to fetch yearly summary records: ${error}` });
        }
    });
    // GET: /face-detection-session/daily-average?companyID=CCC&date=YYYY-MM-DD
    router.get('/daily-average', async (req, res) => {
        try {
            const { date, companyID } = req.query;
            if (!date || typeof date !== 'string' || !companyID || typeof companyID !== 'string') {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const [year, month, day] = date.split('-');
            if (!year || !month || !day) {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const startOfDay = fromZonedTime(new Date(`${date}T00:00:00`), timeZone);
            const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
            const startOfDayTimestamp = admin.firestore.Timestamp.fromDate(startOfDay);
            const endOfDayTimestamp = admin.firestore.Timestamp.fromDate(endOfDay);
            const userIds = await getUserIdsByCompanyID(companyID);
            if (userIds.length === 0) {
                return res.json({
                    totalSessionHours: 0,
                    totalNumberOfAlert: 0,
                    alertPerHour: 0,
                    data: [],
                });
            }
            const querySnapshot = await faceDetectionSessionCollection
                .where('userId', 'in', userIds)
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
                    const localTime = toZonedTime(currentTime, timeZone);
                    const localHourString = localTime.getHours();
                    const nextHour = new Date(currentTime);
                    nextHour.setHours(currentHour + 1, 0, 0, 0);
                    const EndTime = Math.min(nextHour.getTime(), sessionEnd.getTime());
                    const Duration = (EndTime - currentTime.getTime()) / 3600000;
                    if (!result[localHourString]) {
                        result[localHourString] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                    }
                    result[localHourString].totalSessionHours += Duration;
                    totalSessionHours += Duration;
                    remainingDuration -= Duration;
                    currentTime.setHours(currentHour + 1, 0, 0, 0);
                    currentHour = currentTime.getHours();
                }
                // Allocate alerts to each hour
                session.alerts?.forEach(alert => {
                    const alertTime = alert.toDate();
                    const localAlertTime = toZonedTime(alertTime, timeZone);
                    const localAlertHourString = localAlertTime.getHours();
                    if (!result[localAlertHourString]) {
                        result[localAlertHourString] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                    }
                    result[localAlertHourString].totalNumberOfAlert += 1;
                    totalNumberOfAlert += 1;
                });
            });
            const dayHours = Array.from({ length: 24 }, (_, i) => {
                const hour = String(i).padStart(2, '0');
                return `${date} ${hour}:00`;
            });
            const processedData = dayHours.map((dateTime, i) => {
                const hourlyData = result[i] || { totalSessionHours: 0, totalNumberOfAlert: 0 };
                const alertsPerHour = hourlyData.totalSessionHours > 0
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
                alertPerHour: parseFloat((totalNumberOfAlert / totalSessionHours).toFixed(2)),
                data: processedData,
            });
        }
        catch (error) {
            console.error('Error fetching daily average data:', error);
            res.status(500).json({ error: `Failed to fetch daily average records: ${error}` });
        }
    });
    // GET: /face-detection-session/weekly-average?companyID=CCC&date=YYYY-MM-DD
    router.get('/weekly-average', async (req, res) => {
        try {
            const { date, companyID } = req.query;
            if (!date || typeof date !== 'string' || !companyID || typeof companyID !== 'string') {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const startOfDay = fromZonedTime(new Date(`${date}T00:00:00`), timeZone);
            const startOfWeek = new Date(startOfDay);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 7);
            endOfWeek.setSeconds(endOfWeek.getSeconds() - 1);
            const startOfWeekTimestamp = admin.firestore.Timestamp.fromDate(startOfWeek);
            const endOfWeekTimestamp = admin.firestore.Timestamp.fromDate(endOfWeek);
            const userIds = await getUserIdsByCompanyID(companyID);
            if (userIds.length === 0) {
                return res.json({
                    totalSessionHours: 0,
                    totalNumberOfAlert: 0,
                    alertPerHour: 0,
                    data: [],
                });
            }
            const querySnapshot = await faceDetectionSessionCollection
                .where('userId', 'in', userIds)
                .where('startTime', '>=', startOfWeekTimestamp)
                .where('startTime', '<=', endOfWeekTimestamp)
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
                let remainingDuration = session.sessionDuration / 3600;
                // Allocate session duration to each day
                while (remainingDuration > 0) {
                    const localCurrentTime = toZonedTime(currentTime, timeZone);
                    const currentDateString = localCurrentTime.toLocaleDateString('en-CA');
                    const localNextDay = new Date(localCurrentTime);
                    localNextDay.setDate(localNextDay.getDate() + 1);
                    localNextDay.setHours(0, 0, 0, 0);
                    const nextDay = fromZonedTime(localNextDay, timeZone);
                    const EndTime = Math.min(nextDay.getTime(), sessionEnd.getTime());
                    const Duration = (EndTime - currentTime.getTime()) / 3600000;
                    if (!result[currentDateString]) {
                        result[currentDateString] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                    }
                    result[currentDateString].totalSessionHours += Duration;
                    totalSessionHours += Duration;
                    remainingDuration -= Duration;
                    currentTime.setTime(EndTime);
                }
                // Allocate alerts to each day
                session.alerts?.forEach(alert => {
                    const alertTime = alert.toDate();
                    const localAlertTime = toZonedTime(alertTime, timeZone);
                    const alertDateString = localAlertTime.toLocaleDateString('en-CA');
                    if (!result[alertDateString]) {
                        result[alertDateString] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                    }
                    result[alertDateString].totalNumberOfAlert += 1;
                    totalNumberOfAlert += 1;
                });
            });
            const weekDates = Array.from({ length: 7 }, (_, i) => {
                const day = new Date(startOfWeek);
                day.setDate(startOfWeek.getDate() + i);
                return day.toLocaleDateString('en-CA');
            });
            const processedData = weekDates.map(day => {
                const dailyData = result[day] || { totalSessionHours: 0, totalNumberOfAlert: 0 };
                const alertPerHour = dailyData.totalSessionHours > 0
                    ? dailyData.totalNumberOfAlert / dailyData.totalSessionHours
                    : 0;
                return {
                    date: day,
                    totalSessionHours: parseFloat(dailyData.totalSessionHours.toFixed(2)),
                    totalNumberOfAlert: dailyData.totalNumberOfAlert,
                    alertPerHour: parseFloat(alertPerHour.toFixed(2)),
                };
            });
            console.log('startOfWeek:', startOfWeek);
            console.log('endOfWeek:', endOfWeek);
            console.log('processedData:', processedData);
            res.json({
                totalSessionHours: parseFloat(totalSessionHours.toFixed(2)),
                totalNumberOfAlert,
                alertPerHour: parseFloat((totalNumberOfAlert / totalSessionHours).toFixed(2)),
                data: processedData,
            });
        }
        catch (error) {
            console.error('Error fetching weekly average data:', error);
            res.status(500).json({ error: `Failed to fetch weekly average records: ${error}` });
        }
    });
    // GET: /face-detection-session/monthly-average?companyID=CCC&date=YYYY-MM
    router.get('/monthly-average', async (req, res) => {
        try {
            const { date, companyID } = req.query;
            if (!date || typeof date !== 'string' || !companyID || typeof companyID !== 'string') {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const [year, month] = date.split('-');
            if (!year || !month) {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const startOfMonth = fromZonedTime(new Date(`${year}-${month}-01T00:00:00`), timeZone);
            const endOfMonth = new Date(startOfMonth);
            endOfMonth.setMonth(startOfMonth.getMonth() + 1);
            endOfMonth.setSeconds(endOfMonth.getSeconds() - 1);
            const startOfMonthTimestamp = admin.firestore.Timestamp.fromDate(startOfMonth);
            const endOfMonthTimestamp = admin.firestore.Timestamp.fromDate(endOfMonth);
            const userIds = await getUserIdsByCompanyID(companyID);
            if (userIds.length === 0) {
                return res.json({
                    totalSessionHours: 0,
                    totalNumberOfAlert: 0,
                    alertPerHour: 0,
                    data: [],
                });
            }
            const querySnapshot = await faceDetectionSessionCollection
                .where('userId', 'in', userIds)
                .where('startTime', '>=', startOfMonthTimestamp)
                .where('startTime', '<=', endOfMonthTimestamp)
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
                let remainingDuration = session.sessionDuration / 3600;
                // Allocate session duration to each day
                while (remainingDuration > 0) {
                    const localCurrentTime = toZonedTime(currentTime, timeZone);
                    const currentDateString = localCurrentTime.toLocaleDateString('en-CA');
                    const localNextDay = new Date(localCurrentTime);
                    localNextDay.setDate(localNextDay.getDate() + 1);
                    localNextDay.setHours(0, 0, 0, 0);
                    const nextDay = fromZonedTime(localNextDay, timeZone);
                    const EndTime = Math.min(nextDay.getTime(), sessionEnd.getTime());
                    const Duration = (EndTime - currentTime.getTime()) / 3600000; // calculated in hours
                    if (!result[currentDateString]) {
                        result[currentDateString] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                    }
                    result[currentDateString].totalSessionHours += Duration;
                    totalSessionHours += Duration;
                    remainingDuration -= Duration;
                    currentTime.setTime(EndTime);
                }
                // Allocate alerts to each day
                session.alerts?.forEach(alert => {
                    const alertTime = alert.toDate();
                    const localAlertTime = toZonedTime(alertTime, timeZone);
                    const alertDateString = localAlertTime.toLocaleDateString('en-CA');
                    if (!result[alertDateString]) {
                        result[alertDateString] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                    }
                    result[alertDateString].totalNumberOfAlert += 1;
                    totalNumberOfAlert += 1;
                });
            });
            const daysInMonth = new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate();
            const monthDates = Array.from({ length: daysInMonth }, (_, i) => {
                const day = new Date(startOfMonth);
                day.setDate(i + 1);
                return day.toLocaleDateString('en-CA');
            });
            const processedData = monthDates.map(day => {
                const dailyData = result[day] || { totalSessionHours: 0, totalNumberOfAlert: 0 };
                const alertPerHour = dailyData.totalSessionHours > 0
                    ? dailyData.totalNumberOfAlert / dailyData.totalSessionHours
                    : 0;
                return {
                    date: day,
                    totalSessionHours: parseFloat(dailyData.totalSessionHours.toFixed(2)),
                    totalNumberOfAlert: dailyData.totalNumberOfAlert,
                    alertPerHour: parseFloat(alertPerHour.toFixed(2)),
                };
            });
            res.json({
                totalSessionHours: parseFloat(totalSessionHours.toFixed(2)),
                totalNumberOfAlert,
                alertPerHour: parseFloat((totalNumberOfAlert / totalSessionHours).toFixed(2)),
                data: processedData,
            });
        }
        catch (error) {
            console.error('Error fetching monthly average data:', error);
            res.status(500).json({ error: `Failed to fetch monthly average records: ${error}` });
        }
    });
    // GET: /face-detection-session/yearly-average?companyID=CCC&date=YYYY
    router.get('/yearly-average', async (req, res) => {
        try {
            const { date, companyID } = req.query;
            if (!date || typeof date !== 'string' || !companyID || typeof companyID !== 'string') {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const year = parseInt(date, 10);
            if (Number.isNaN(year)) {
                return res.status(400).json({ error: 'Invalid parameter.' });
            }
            const startOfYear = fromZonedTime(new Date(`${year}-01-01T00:00:00`), timeZone);
            const endOfYear = new Date(startOfYear);
            endOfYear.setFullYear(startOfYear.getFullYear() + 1);
            endOfYear.setSeconds(endOfYear.getSeconds() - 1);
            const startOfYearTimestamp = admin.firestore.Timestamp.fromDate(startOfYear);
            const endOfYearTimestamp = admin.firestore.Timestamp.fromDate(endOfYear);
            const userIds = await getUserIdsByCompanyID(companyID);
            if (userIds.length === 0) {
                return res.json({
                    totalSessionHours: 0,
                    totalNumberOfAlert: 0,
                    alertPerHour: 0,
                    data: [],
                });
            }
            const querySnapshot = await faceDetectionSessionCollection
                .where('userId', 'in', userIds)
                .where('startTime', '>=', startOfYearTimestamp)
                .where('startTime', '<=', endOfYearTimestamp)
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
                let remainingDuration = session.sessionDuration / 3600;
                // Allocate session duration to each month
                while (remainingDuration > 0) {
                    const localCurrentTime = toZonedTime(currentTime, timeZone);
                    const currentMonthString = localCurrentTime.toLocaleDateString('en-CA', {
                        year: 'numeric',
                        month: '2-digit',
                    });
                    const localNextMonth = new Date(localCurrentTime);
                    localNextMonth.setMonth(localNextMonth.getMonth() + 1);
                    localNextMonth.setDate(1);
                    localNextMonth.setHours(0, 0, 0, 0);
                    const nextMonth = fromZonedTime(localNextMonth, timeZone);
                    const EndTime = Math.min(nextMonth.getTime(), sessionEnd.getTime());
                    const Duration = (EndTime - currentTime.getTime()) / 3600000; // calculated in hours
                    if (!result[currentMonthString]) {
                        result[currentMonthString] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                    }
                    result[currentMonthString].totalSessionHours += Duration;
                    totalSessionHours += Duration;
                    remainingDuration -= Duration;
                    currentTime.setTime(EndTime);
                }
                // Allocate alerts to each month
                session.alerts?.forEach(alert => {
                    const alertTime = alert.toDate();
                    const localAlertTime = toZonedTime(alertTime, timeZone);
                    const alertMonthString = localAlertTime.toLocaleDateString('en-CA', {
                        year: 'numeric',
                        month: '2-digit',
                    });
                    if (!result[alertMonthString]) {
                        result[alertMonthString] = { totalSessionHours: 0, totalNumberOfAlert: 0 };
                    }
                    result[alertMonthString].totalNumberOfAlert += 1;
                    totalNumberOfAlert += 1;
                });
            });
            const yearMonths = Array.from({ length: 12 }, (_, i) => {
                const month = String(i + 1).padStart(2, '0');
                return `${year}-${month}`;
            });
            const processedData = yearMonths.map(month => {
                const monthlyData = result[month] || { totalSessionHours: 0, totalNumberOfAlert: 0 };
                const alertsPerHour = monthlyData.totalSessionHours > 0
                    ? monthlyData.totalNumberOfAlert / monthlyData.totalSessionHours
                    : 0;
                return {
                    date: month,
                    totalSessionHours: parseFloat(monthlyData.totalSessionHours.toFixed(2)),
                    totalNumberOfAlert: monthlyData.totalNumberOfAlert,
                    alertPerHour: parseFloat(alertsPerHour.toFixed(2)),
                };
            });
            console.log('startOfYear:', startOfYear);
            console.log('endOfYear:', endOfYear);
            console.log('processedData:', processedData);
            res.json({
                totalSessionHours: parseFloat(totalSessionHours.toFixed(2)),
                totalNumberOfAlert,
                alertPerHour: parseFloat((totalNumberOfAlert / totalSessionHours).toFixed(2)),
                data: processedData,
            });
        }
        catch (error) {
            console.error('Error fetching yearly average data:', error);
            res.status(500).json({ error: `Failed to fetch yearly average records: ${error}` });
        }
    });
    return router;
};
export default faceDetectionSessionRoutes;
