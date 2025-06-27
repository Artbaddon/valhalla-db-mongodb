# Valhalla Apartment Management System - MongoDB

A modern, scalable apartment management system built with Node.js, Express, and MongoDB. This project demonstrates the migration from a MySQL-based system to MongoDB with comprehensive features for managing apartments, residents, parking, payments, and more.

## 🏗️ Project Structure

```
VALHALLA-MONGODB/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection management
│   ├── models/                  # MongoDB/Mongoose models
│   │   ├── User.js             # Users, Profiles, Owners, Guards, Pets
│   │   ├── Tower.js            # Towers, Apartments, Apartment Status
│   │   ├── Parking.js          # Parking spaces, Vehicle types
│   │   ├── PQRS.js             # Complaints, Requests, Tracking
│   │   ├── Reservation.js      # Amenity reservations
│   │   ├── Notification.js     # System notifications
│   │   ├── Survey.js           # Surveys and questions
│   │   ├── Payment.js          # Payment processing
│   │   └── Permission.js       # Roles, Permissions, Modules
│   ├── controllers/            # API controllers (to be created)
│   ├── routes/                 # API routes (to be created)
│   └── services/               # Business logic services (to be created)
├── scripts/
│   └── migrate-from-sql.js    # Migrate data from MySQL
├── uploads/                   # File uploads directory
├── complete-spanish-seed.js   # Production-ready seed script with Spanish data
├── test-seed.js              # Test script to verify seeding
├── .env.example              # Environment variables template
├── app.js                    # Main application file
```
└── package.json              # Project dependencies
```

## 🚀 Features

### Core Models & Functionality

- **User Management**: Complete user system with profiles, roles, and permissions
- **Tower & Apartment Management**: Multi-tower support with apartment tracking
- **Parking Management**: Parking space allocation and vehicle management
- **PQRS System**: Complaints, requests, and tracking system
- **Reservation System**: Amenity booking and management
- **Payment Processing**: Payment tracking and management
- **Notification System**: System-wide notifications
- **Survey System**: Feedback collection and management
- **Permission System**: Role-based access control (RBAC)

### Technical Features

- **ES Modules**: Modern JavaScript with import/export
- **MongoDB/Mongoose**: NoSQL database with ODM
- **Data Migration**: MySQL to MongoDB migration tools
- **Comprehensive Validation**: Input validation with Joi
- **File Upload Support**: Multer integration
- **Error Handling**: Centralized error management
- **Environment Configuration**: Flexible environment setup

## 📋 Prerequisites

- Node.js (v16+ recommended)
- MongoDB (local or Atlas)
- MySQL (only for migration from existing SQL database)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd VALHALLA-MONGODB
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and configuration
   ```

4. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in your `.env` file

## 🌱 Database Seeding

This project includes comprehensive seeding scripts to populate your MongoDB database with realistic test data in Spanish.

### Available Scripts

1. **Seed Database (Recommended)**
   ```bash
   npm run seed
   ```
   - Runs `complete-spanish-seed.js`
   - Populates all collections with comprehensive Spanish test data
   - Includes: Users, Towers, Apartments, Parking, PQRS, Payments, Notifications, Reservations, Surveys, Permissions, Roles
   - Creates 4 test users with different roles (admin, owners, guard)
   - Generates realistic relationships between all entities

2. **Test Seeding**
   ```bash
   npm run test-seed
   ```
   - Runs `test-seed.js`
   - Verifies that all collections are properly populated
   - Shows document counts for each collection
   - Useful for confirming successful seeding

### Seed Data Overview

The seeding creates:
- **4 Users**: 1 admin, 2 property owners, 1 security guard
- **2 Towers**: Torre A & Torre B with 5 apartments total
- **3 Parking Spaces**: Different types (car, motorcycle, bicycle)
- **2 PQRS Records**: Sample complaints/requests with tracking
- **2 Payments**: Payment history with different statuses
- **2 Notifications**: System notifications for residents
- **4 Reservations**: Amenity bookings (pool, BBQ, meeting room, gym)
- **1 Survey**: Satisfaction survey with 5 questions and 2 responses
- **Complete Permission System**: Roles, permissions, modules, and statuses

### Test Credentials
After seeding, you can use these credentials:
- **Admin**: `admin` / `admin123` (Carlos Ramírez)
- **Owner 1**: `maria.garcia` / `maria123` (María García - Torre A-301)
- **Owner 2**: `luis.martinez` / `luis123` (Luis Martínez - Torre B-102)
- **Guard**: `jorge.vigilante` / `jorge123` (Jorge Morales)

## 🚦 Getting Started

### Option 1: Start with Sample Data (Recommended)

1. **Seed the database with sample data**
   ```bash
   npm run seed
   ```

2. **Verify seeding was successful**
   ```bash
   npm run test-seed
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

### Option 2: Migrate from Existing MySQL Database

1. **Set up MySQL connection in .env**
   ```env
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=vallhalladb
   ```

2. **Run the migration script**
   ```bash
   npm run migrate
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

Once the server is running, visit:
- **API Overview**: `http://localhost:3000/api`
- **Health Check**: `http://localhost:3000/health`

### Available Endpoints

```
GET  /api                     # API documentation
GET  /health                  # Health check

# Users & Authentication
GET  /api/users              # List users
POST /api/users              # Create user
GET  /api/users/:id          # Get user details
PUT  /api/users/:id          # Update user
DELETE /api/users/:id        # Delete user

# Towers & Apartments
GET  /api/towers             # List towers
POST /api/towers             # Create tower
GET  /api/apartments         # List apartments
POST /api/apartments         # Create apartment

# Parking
GET  /api/parking            # List parking spaces
POST /api/parking            # Create parking space

# PQRS (Complaints/Requests)
GET  /api/pqrs               # List PQRS
POST /api/pqrs               # Create PQRS
PUT  /api/pqrs/:id/status    # Update PQRS status

# Reservations
GET  /api/reservations       # List reservations
POST /api/reservations       # Create reservation

# Payments
GET  /api/payments           # List payments
POST /api/payments           # Process payment

# Notifications
GET  /api/notifications      # List notifications
POST /api/notifications      # Send notification

# Surveys
GET  /api/surveys            # List surveys
POST /api/surveys            # Create survey

# System Management
GET  /api/permissions        # List permissions
GET  /api/roles              # List roles
GET  /api/modules            # List modules
```

## 🗂️ Database Models

### User System
- **User**: Main user account with authentication
- **Profile**: User personal information (embedded)
- **Owner**: Property owner specific data (embedded)
- **Guard**: Security guard specific data (embedded)
- **Pet**: Pet information (embedded in Owner)

### Property Management
- **Tower**: Building/tower information
- **Apartment**: Individual apartment details
- **ApartmentStatus**: Apartment status lookup

### Parking System
- **Parking**: Parking space management
- **ParkingStatus**: Parking availability status
- **ParkingType**: Type of parking space
- **VehicleType**: Vehicle classification

### Communication
- **PQRS**: Complaints, requests, suggestions
- **PQRSCategory**: PQRS classification
- **PQRSTracking**: Status tracking
- **Notification**: System notifications
- **Survey**: Feedback collection

### Financial
- **Payment**: Payment processing and tracking
- **PaymentStatus**: Payment status lookup

### Authorization
- **Role**: User roles definition
- **Permission**: System permissions
- **Module**: System modules/features
- **UserStatus**: User account status

## 🔧 Development Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Populate database with sample data
npm run migrate    # Migrate data from MySQL to MongoDB
npm test           # Run tests (to be implemented)
```

## 🏗️ Architecture Decisions

### Why MongoDB over MySQL?

1. **Flexible Schema**: Easily adapt to changing requirements
2. **Embedded Documents**: Reduce joins for related data
3. **Scalability**: Better horizontal scaling capabilities
4. **JSON-like Documents**: Natural fit for JavaScript/Node.js
5. **Rich Queries**: Powerful query capabilities with aggregation

### Data Modeling Decisions

1. **User Profiles Embedded**: Profile data is always needed with user data
2. **Apartments Reference Towers**: Many-to-one relationship maintained as reference
3. **Permissions System**: Role-based access control with module-permission mapping
4. **Payment Items Embedded**: Line items are part of payment document
5. **PQRS Tracking**: Separate collection for audit trail

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control (RBAC)
- Input validation with Joi
- File upload restrictions
- Environment-based configuration

## 📈 Performance Considerations

- Database indexes on frequently queried fields
- Aggregation pipelines for complex queries
- Connection pooling for database connections
- Efficient data structures (embedded vs referenced)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using Node.js, Express, and MongoDB**
# valhalla-db-mongodb
