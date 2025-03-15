/* eslint-disable import/extensions */
import express from 'express';
import cors from 'cors';
import router from './routes/index.js';

const app = express();
app.use(express.json());
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:5174',
        'https://drivebuddy.wmdd4950.com', // Note: Remove trailing slash
      ];

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all origins as a fallback for development
        // In production you might want to be more restrictive
      }
    },
    credentials: true,
  }),
);

const PORT = 3000;

// Root end point
app.use('/', router);

// 404 error handling
app.use('*', (req, res) => {
  res.status(404).json({
    status: '404',
    message: 'Route not found',
  });
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server is running on port ${PORT}`));
