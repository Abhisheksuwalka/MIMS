import bodyParser from "body-parser";
import cors from "cors";
import Express from "express";
import connect from "../configDB/index.js";
import medicineRoutes from "../routes/medicine/index.js"; // Fixed typo
import storeRouter from "../routes/storeRoutes/index.js";
import logger, { requestLogger } from "../utils/logger.js";

const app = Express();

// Security middleware
app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Request logging middleware
app.use(requestLogger);

// Body parser middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: false, limit: '10mb' }));

// Database connection
connect();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use("/store", storeRouter);
app.use("/medicines", medicineRoutes);

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
      path: req.path
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Server Error:', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message,
      code: 'SERVER_ERROR'
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info('MIMS Backend Server Started', { 
    port: PORT, 
    mode: process.env.NODE_ENV || 'development' 
  });
  
  console.log(`
╔═══════════════════════════════════════╗
║   MIMS Backend Server Started         ║
╠═══════════════════════════════════════╣
║   Port: ${PORT}                           ║
║   Mode: ${process.env.NODE_ENV || 'development'}                  ║
║   Time: ${new Date().toLocaleTimeString()}                     ║
╚═══════════════════════════════════════╝
  `);
});

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received: closing HTTP server`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  
  // Force close after 10s
  setTimeout(() => {
    logger.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
