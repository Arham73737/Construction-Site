import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import siteRoutes from './routes/site.routes.js';
import taskRoutes from './routes/task.routes.js';
import fileRoutes from './routes/file.routes.js';

dotenv.config();

const app = express();

// ✅ Support multiple origins from .env (comma separated)
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(',').map(origin => origin.trim())
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman or curl) or matching frontend
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(morgan('dev'));
app.use(express.json());

// 🚀 Disable caching for all API responses
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store'); // always fetch new data
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/files', fileRoutes);

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error('DB connection failed', err);
    process.exit(1);
  });
