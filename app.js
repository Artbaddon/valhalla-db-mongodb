import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectMongoDB } from './src/config/database.js';

// Import all models
import './src/models/User.js';
import './src/models/Tower.js';
import './src/models/Parking.js';
import './src/models/PQRS.js';
import './src/models/Reservation.js';
import './src/models/Notification.js';
import './src/models/Survey.js';
import './src/models/Payment.js';
import './src/models/Permission.js';

// Import routes (we'll create these)
// import userRoutes from './src/routes/userRoutes.js';
// import towerRoutes from './src/routes/towerRoutes.js';
// import parkingRoutes from './src/routes/parkingRoutes.js';
// import pqrsRoutes from './src/routes/pqrsRoutes.js';
// import reservationRoutes from './src/routes/reservationRoutes.js';
// import notificationRoutes from './src/routes/notificationRoutes.js';
// import surveyRoutes from './src/routes/surveyRoutes.js';
// import paymentRoutes from './src/routes/paymentRoutes.js';
// import permissionRoutes from './src/routes/permissionRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================
// MIDDLEWARE
// =====================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// =====================================
// ROUTES
// =====================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Valhalla Apartment Management API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      towers: '/api/towers',
      apartments: '/api/apartments',
      parking: '/api/parking',
      pqrs: '/api/pqrs',
      reservations: '/api/reservations',
      notifications: '/api/notifications',
      surveys: '/api/surveys',
      payments: '/api/payments',
      permissions: '/api/permissions',
      roles: '/api/roles',
      modules: '/api/modules'
    }
  });
});

// Uncomment these as you create the route files
// app.use('/api/users', userRoutes);
// app.use('/api/towers', towerRoutes);
// app.use('/api/parking', parkingRoutes);
// app.use('/api/pqrs', pqrsRoutes);
// app.use('/api/reservations', reservationRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/surveys', surveyRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/permissions', permissionRoutes);

// =====================================
// ERROR HANDLING
// =====================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  // Mongoose validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      messages: errors,
      timestamp: new Date().toISOString()
    });
  }
  
  // Mongoose duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({
      error: 'Duplicate Entry',
      message: `${field} already exists`,
      timestamp: new Date().toISOString()
    });
  }
  
  // Mongoose cast errors
  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID',
      message: 'Invalid ID format',
      timestamp: new Date().toISOString()
    });
  }
  
  // Default error
  res.status(error.status || 500).json({
    error: error.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// =====================================
// START SERVER
// =====================================
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectMongoDB();
    console.log('✅ Connected to MongoDB');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API Documentation: http://localhost:${PORT}/api`);
      console.log(`💊 Health Check: http://localhost:${PORT}/health`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('\n📚 Available Models:');
        console.log('   - User (users, profiles, owners, guards, pets)');
        console.log('   - Tower (towers, apartments)');
        console.log('   - Parking (parking spaces, vehicle types)');
        console.log('   - PQRS (complaints, tracking)');
        console.log('   - Reservation (amenity reservations)');
        console.log('   - Notification (system notifications)');
        console.log('   - Survey (surveys and questions)');
        console.log('   - Payment (payment processing)');
        console.log('   - Permission (roles, modules, permissions)');
        console.log('\n🔗 Next steps:');
        console.log('   1. Create controllers in src/controllers/');
        console.log('   2. Create routes in src/routes/');
        console.log('   3. Run seed script to populate data');
        console.log('   4. Test API endpoints');
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the application
startServer();

export default app;
