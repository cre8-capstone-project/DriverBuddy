/* eslint-disable import/extensions */
import express from 'express';
import cors from 'cors';
import router from './routes/index.js';

const app = express();
app.use(express.json());
app.use(cors({origin: '*', credentials: false}));

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
