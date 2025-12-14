const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('⚠️  MONGODB_URI is not defined in .env file');
  console.error('Please add MONGODB_URI to your .env file');
}

mongoose.connect(MONGODB_URI || 'mongodb://localhost:27017/fitplanhub', {
  // Remove deprecated options for newer mongoose versions
})
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Please check your MONGODB_URI in .env file');
  });

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend server is running!', 
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/follows', require('./routes/follows'));
app.use('/api/feed', require('./routes/feed'));
app.use('/api/trainers', require('./routes/trainers'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🗄️  Database: ${MONGODB_URI ? 'MongoDB Atlas' : 'Not configured'}`);
});

