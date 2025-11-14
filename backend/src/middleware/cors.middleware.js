/**
 * CORS Middleware Configuration
 * Allows both frontend-website and frontend-mobile-react-native-app to access the API
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000', // Alternative port
      'http://localhost:8080', // Alternative port
      process.env.FRONTEND_URL, // Production website URL
      process.env.MOBILE_URL, // Production mobile URL (if web version)
    ].filter(Boolean); // Remove undefined values

    // Check if origin is allowed
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies/credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = corsOptions;

