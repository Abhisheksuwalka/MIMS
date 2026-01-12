import dotenv from 'dotenv';
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

dotenv.config();

const uri = process.env.MONGODB_URI;

// Connection options
const options = {
  appName: 'MIMS_Backend',
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000, // Fail fast if no server found
  maxPoolSize: 10, // Maintain up to 10 socket connections
};

async function Connect() {
  if (!uri) {
    logger.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    // Monitor connection events
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Handle initial connection
    await mongoose.connect(uri, options);
    
  } catch (err) {
    logger.error('Failed to connect to MongoDB', { error: err.message });
    // Don't exit process in dev mode to allow checking health endpoint
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

export default Connect;
