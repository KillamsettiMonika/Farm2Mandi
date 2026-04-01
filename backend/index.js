const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const corsOptions = require('cors');

dotenv.config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/auth');
const predictRoutes = require('./routes/predict');
const driverRoutes = require('./routes/driver');
const transportRoutes = require('./routes/transport');
const contactRoutes = require('./routes/contact');


const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to allow the frontend origin and include credentials (cookies)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://farm2mandi.onrender.com',
  'https://farm2-mandi.vercel.app'   // 👈 ADD THIS
];
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api', predictRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/contact', contactRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Farm2Mandi backend running. See /api endpoints.' });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found', 
    message: `Cannot ${req.method} ${req.path}`,
    availableRoutes: [
      'GET /health',
      'GET /api/test',
      'GET /api/predict (requires auth)',
      'POST /api/predict (requires auth)',
      'POST /api/auth/login',
      'POST /api/auth/register'
    ]
  });
});

async function start() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI not set in environment. Create a .env file with MONGO_URI.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, { dbName: process.env.MONGO_DB || undefined });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
  });
}

start();
