const app = require('./app');
const connectDB = require('./config/db');
const appConfig = require('./config/appConfig');
const { startScheduler } = require('./jobs/reminder.job');

/**
 * Validate Required Environment Variables
 */
const validateEnv = () => {
  const required = ['MONGO_URI', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n💡 Please set these in your .env file');
    process.exit(1);
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters long for security');
  }
};

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Validate environment variables
    validateEnv();

    // Connect to MongoDB
    await connectDB();

    // Start Express server
    const PORT = appConfig.PORT;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${appConfig.NODE_ENV}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
      console.log(`✅ JWT_SECRET: ${process.env.JWT_SECRET ? 'Set ✓' : 'Missing ✗'}`);
      
      // Start reminder scheduler
      startScheduler();
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

