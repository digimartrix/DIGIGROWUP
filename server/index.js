import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow localhost and any vercel.app deployment
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.CLIENT_ORIGIN,
    ];
    if (allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// ── Cached MongoDB connection for Vercel serverless ──
let isConnected = false;
let connectionPromise = null;

async function connectDB() {
  if (isConnected) return;
  // Reuse in-flight connection promise to avoid duplicate connects
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
    bufferCommands: false,
    maxPoolSize: 5,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 5000,
  }).then(() => {
    isConnected = true;
    connectionPromise = null;
    console.log('[DB] Connected to MongoDB');
  }).catch((err) => {
    connectionPromise = null;
    console.error('[DB] Connection failed:', err.message);
    throw err;
  });

  return connectionPromise;
}

// Middleware: ensure DB is connected before any route handler runs
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: 'Database connection failed.' });
  }
});

import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import lessonRoutes from './routes/lessons.js';
import quizRoutes from './routes/quizzes.js';
import masteryRoutes from './routes/mastery.js';
import aiRoutes from './routes/ai.js';
import ecosystemRoutes from './routes/ecosystem.js';
import mentorRoutes from './routes/mentors.js';
import communityRoutes from './routes/community.js';
import eventRoutes from './routes/events.js';
import creditRoutes, { handleCreateOrder, handleVerifyPayment } from './routes/credits.js';
import resourceRoutes from './routes/resources.js';
import notificationRoutes from './routes/notifications.js';
import achievementRoutes from './routes/achievements.js';
import projectRoutes from './routes/projects.js';
import adminRoutes from './routes/admin.js';
import instructorRoutes from './routes/instructor.js';
import uploadRoutes from './routes/uploads.js';
import progressRoutes from './routes/progress.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/mastery', masteryRoutes);
app.use('/api/next-action', masteryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ecosystem', ecosystemRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/progress', progressRoutes);

// Root Razorpay standard checkout endpoints
app.post('/api/create-order', protect, handleCreateOrder);
app.post('/api/verify-payment', protect, handleVerifyPayment);

// Global error handler — never leaks stack traces to client
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack || err.message);
  res.status(err.status || 500).json({
    message: err.status ? err.message : 'Something went wrong. Please try again.',
  });
});

const PORT = process.env.PORT || 5000;

// Local development: start listening on port
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`[SERVER] Running on port ${PORT}`));
  });
}

// Vercel serverless: export the Express app
export default app;
