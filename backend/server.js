require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS - allow all origins (needed for mobile app)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
const authRoutes = require('./routes/authRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const solutionRoutes = require('./routes/solutionRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const adminRoutes = require('./routes/adminRoutes');
const profileRoutes = require('./routes/profileRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/solutions', solutionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'SolveX API is running!', version: '3.0.0', status: 'ok' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/solvex';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('🚀 SolveX server running on port ' + PORT);
      console.log('📱 Mobile API URL: http://YOUR_PC_IP:' + PORT + '/api');
      console.log('🌐 Test in browser: http://localhost:' + PORT);
      console.log('');
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('Make sure MongoDB is running: sudo systemctl start mongod');
    process.exit(1);
  });
