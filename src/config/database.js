import mongoose from 'mongoose';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

class DatabaseManager {
  constructor() {
    this.mongoConnection = null;
    this.mysqlConnection = null;
  }

  // =====================================
  // MONGODB CONNECTION
  // =====================================
  async connectMongoDB() {
    try {
      console.log('🔄 Connecting to MongoDB...');
      
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      };

      this.mongoConnection = await mongoose.connect(process.env.MONGODB_URI, options);
      
      console.log('✅ MongoDB Connected Successfully!');
      console.log(`📊 Database: ${mongoose.connection.name}`);
      console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);

      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB Error:', error.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('📡 MongoDB Disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB Reconnected');
      });

      return this.mongoConnection;

    } catch (error) {
      console.error('💥 MongoDB Connection Failed:', error.message);
      console.error('🔧 Check your connection string in .env file');
      process.exit(1);
    }
  }

  // =====================================
  // MYSQL CONNECTION (for migration)
  // =====================================
  async connectMySQL() {
    try {
      console.log('🔄 Connecting to MySQL...');
      
      this.mysqlConnection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: process.env.MYSQL_PORT,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
      });

      console.log('✅ MySQL Connected Successfully!');
      console.log(`📊 Database: ${process.env.MYSQL_DATABASE}`);
      
      return this.mysqlConnection;

    } catch (error) {
      console.error('💥 MySQL Connection Failed:', error.message);
      console.error('🔧 Check your MySQL credentials in .env file');
      throw error;
    }
  }

  // =====================================
  // CONNECTION HEALTH CHECK
  // =====================================
  async checkConnections() {
    const status = {
      mongodb: 'disconnected',
      mysql: 'disconnected',
      timestamp: new Date().toISOString()
    };

    try {
      if (mongoose.connection.readyState === 1) {
        status.mongodb = 'connected';
      }
    } catch (error) {
      status.mongodb = 'error';
    }

    try {
      if (this.mysqlConnection) {
        await this.mysqlConnection.ping();
        status.mysql = 'connected';
      }
    } catch (error) {
      status.mysql = 'error';
    }

    return status;
  }

  // =====================================
  // GRACEFUL SHUTDOWN
  // =====================================
  async disconnect() {
    console.log('🛑 Closing database connections...');
    
    try {
      if (this.mongoConnection) {
        await mongoose.connection.close();
        console.log('👋 MongoDB connection closed');
      }

      if (this.mysqlConnection) {
        await this.mysqlConnection.end();
        console.log('👋 MySQL connection closed');
      }

    } catch (error) {
      console.error('❌ Error closing connections:', error.message);
    }
  }
}

// Create and export database manager instance
const dbManager = new DatabaseManager();

// Export instance methods as named exports for convenience
export const connectMongoDB = () => dbManager.connectMongoDB();
export const connectMySQL = () => dbManager.connectMySQL();
export const closeConnections = () => dbManager.closeConnections();

// Export the instance as default
export default dbManager;
