# 🏢 Valhalla - Modern Apartment Management System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern, scalable apartment management system built with **Node.js**, **Express**, and **MongoDB**. Valhalla provides comprehensive features for managing residential complexes, including tenant management, parking allocation, payment processing, and community communication tools.

## ✨ Why Valhalla?

- 🚀 **Modern Architecture**: Built with ES6+ modules and latest best practices
- 🏗️ **Scalable Design**: MongoDB-powered for horizontal scaling
- 🔐 **Secure**: Role-based access control with JWT authentication
- 🌍 **Multi-language**: Full Spanish support with internationalization ready
- 📱 **API-First**: RESTful API design for mobile and web applications
- 🛠️ **Developer Friendly**: Comprehensive seeding and migration tools

## 🏗️ Project Structure

```
VALHALLA-MONGODB/
├── 📁 src/
│   ├── 📁 config/
│   │   └── 📄 database.js          # MongoDB connection & configuration
│   ├── 📁 models/                  # Mongoose data models
│   │   ├── 📄 User.js             # Users, profiles, roles
│   │   ├── 📄 Tower.js            # Buildings & apartments
│   │   ├── 📄 Parking.js          # Parking management
│   │   ├── 📄 PQRS.js             # Complaints & requests
│   │   ├── 📄 Reservation.js      # Amenity bookings
│   │   ├── 📄 Notification.js     # System notifications
│   │   ├── 📄 Survey.js           # Feedback surveys
│   │   ├── 📄 Payment.js          # Payment processing
│   │   └── 📄 Permission.js       # Access control
│   ├── 📁 controllers/            # Business logic controllers
│   ├── 📁 routes/                 # API route definitions
│   ├── 📁 services/               # External service integrations
│   └── 📁 middleware/             # Custom middleware
├── 📁 scripts/
│   ├── 📄 complete-spanish-seed.js # Production seed data
│   ├── 📄 test-seed.js           # Seed verification
│   └── 📄 migrate-from-sql.js    # MySQL migration tool
├── 📁 uploads/                    # File upload directory
├── 📄 app.js                     # Express application setup
├── 📄 package.json               # Dependencies & scripts
├── 📄 .env.example              # Environment template
└── 📄 README.md                 # This file
```

### 🧩 Key Components

- **Models**: Mongoose schemas with validation, indexes, and business logic
- **Controllers**: RESTful API handlers with error management
- **Routes**: Express router configuration with middleware
- **Services**: External integrations (email, SMS, payments)
- **Scripts**: Database utilities and development tools

## � Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Database Setup](#-database-setup)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)

## 🚀 Features

### 👥 **User Management**
- Multi-role user system (Admin, Owner, Guard, Resident)
- Secure authentication with JWT tokens
- Profile management with photo uploads
- Pet registration for residents

### 🏢 **Property Management**
- Multi-tower/building support
- Apartment status tracking
- Owner and tenant management
- Real-time occupancy status

### 🚗 **Parking System**
- Smart parking space allocation
- Vehicle type management (Car, Motorcycle, Bicycle)
- Real-time availability tracking
- Reservation system for visitors

### 💳 **Payment Processing**
- Monthly maintenance fee tracking
- Payment history and receipts
- Multiple payment method support
- Automatic late fee calculation

### 📢 **Communication Hub**
- PQRS system (Complaints, Requests, Suggestions)
- System-wide notifications
- Emergency alerts with priority levels
- Community announcements

### 📊 **Analytics & Reporting**
- Resident satisfaction surveys
- Payment analytics
- Occupancy reports
- System usage statistics

### 🔐 **Security & Access Control**
- Role-based permissions (RBAC)
- Module-level access control
- Audit trail for sensitive operations
- Secure file upload handling

## ⚡ Quick Start

Get up and running with Valhalla in just a few commands:

```bash
# Clone the repository
git clone https://github.com/yourusername/valhalla-mongodb.git
cd valhalla-mongodb

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string

# Seed the database with sample data
npm run seed

# Start the development server
npm run dev
```

🎉 **That's it!** Your Valhalla instance is now running at `http://localhost:3000`

### 🔑 Test Credentials
Use these credentials to explore the system:
- **👨‍💼 Admin**: `admin` / `admin123` (Carlos Ramírez)
- **🏠 Owner**: `maria.garcia` / `maria123` (María García - Torre A-301)
- **🛡️ Guard**: `jorge.vigilante` / `jorge123` (Jorge Morales)

## 🛠️ Installation

### Prerequisites
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MongoDB** v6.0+ ([Local](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/atlas))
- **Git** ([Download](https://git-scm.com/))

### Step-by-Step Setup

1. **📥 Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/valhalla-mongodb.git
   cd valhalla-mongodb
   ```

2. **📦 Install Dependencies**
   ```bash
   npm install
   ```

3. **⚙️ Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/valhalla
   
   # Server
   PORT=3000
   NODE_ENV=development
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   
   # File Uploads
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=5MB
   ```

4. **🗄️ Set up MongoDB**
   
   **Option A: Local MongoDB**
   ```bash
   # Install MongoDB Community Edition
   # Start MongoDB service
   mongod --dbpath /path/to/your/db
   ```
   
   **Option B: MongoDB Atlas (Recommended)**
   1. Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
   2. Create a new cluster
   3. Get connection string and update `MONGODB_URI` in `.env`

## 🗄️ Database Setup

Valhalla includes powerful seeding tools to get you started quickly with realistic test data.

### 🌱 Quick Seeding (Recommended)

**Populate with Spanish test data:**
```bash
npm run seed
```

This creates:
- 👥 **4 Users** with different roles
- 🏢 **2 Towers** (Torre A & Torre B) with 5 apartments
- 🚗 **3 Parking spaces** (car, motorcycle, bicycle)
- 📝 **2 PQRS records** with tracking history
- 💳 **2 Payment records** with different statuses
- 📢 **2 System notifications**
- 🎯 **4 Amenity reservations** (pool, BBQ, gym, meeting room)
- 📊 **1 Satisfaction survey** with responses
- 🔐 **Complete permission system** with roles

### 🔄 Migrating from MySQL

If you have an existing MySQL Valhalla database:

```bash
# Configure MySQL connection in .env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=vallhalladb

# Run migration
npm run migrate
```

### ✅ Verify Setup

```bash
# Check if seeding was successful
npm run test-seed

# Expected output:
# ✓ Users: 4 documents
# ✓ Towers: 2 documents  
# ✓ Apartments: 5 documents
# ✓ Parking: 3 documents
# ... and more
```

## 🚦 Development Commands

```bash
# 🚀 Start development server (with auto-reload)
npm run dev

# 📦 Start production server  
npm start

# 🌱 Populate database with sample data
npm run seed

# ✅ Verify database seeding
npm run test-seed

# 🔄 Migrate from MySQL database
npm run migrate

# 🧪 Run tests (coming soon)
npm test

# 🧹 Clean database (removes all data)
npm run clean
```

## 📚 API Documentation

### 🏠 Base URLs
- **Development**: `http://localhost:3000`
- **API Base**: `http://localhost:3000/api`
- **Health Check**: `http://localhost:3000/health`

### 🔑 Authentication
All protected endpoints require a JWT token in the Authorization header:
```bash
Authorization: Bearer <your-jwt-token>
```

### 📋 Available Endpoints

<details>
<summary><strong>👥 Users & Authentication</strong></summary>

```http
POST   /api/auth/login           # User login
POST   /api/auth/register        # User registration
POST   /api/auth/refresh         # Refresh JWT token
GET    /api/users               # List all users (admin)
POST   /api/users               # Create new user (admin)
GET    /api/users/:id           # Get user details
PUT    /api/users/:id           # Update user
DELETE /api/users/:id           # Delete user (admin)
GET    /api/users/profile       # Get current user profile
PUT    /api/users/profile       # Update current user profile
```
</details>

<details>
<summary><strong>🏢 Towers & Apartments</strong></summary>

```http
GET    /api/towers              # List all towers
POST   /api/towers              # Create new tower (admin)
GET    /api/towers/:id          # Get tower details
PUT    /api/towers/:id          # Update tower (admin)
GET    /api/apartments          # List apartments
POST   /api/apartments          # Create apartment (admin)
GET    /api/apartments/:id      # Get apartment details
PUT    /api/apartments/:id      # Update apartment
```
</details>

<details>
<summary><strong>🚗 Parking Management</strong></summary>

```http
GET    /api/parking             # List parking spaces
POST   /api/parking             # Create parking space (admin)
GET    /api/parking/:id         # Get parking details
PUT    /api/parking/:id         # Update parking space
GET    /api/parking/available   # Get available spaces
POST   /api/parking/:id/assign  # Assign parking space
```
</details>

<details>
<summary><strong>📝 PQRS System</strong></summary>

```http
GET    /api/pqrs                # List PQRS records
POST   /api/pqrs                # Create new PQRS
GET    /api/pqrs/:id            # Get PQRS details
PUT    /api/pqrs/:id            # Update PQRS
PUT    /api/pqrs/:id/status     # Update PQRS status (admin)
GET    /api/pqrs/categories     # Get PQRS categories
```
</details>

<details>
<summary><strong>🎯 Reservations</strong></summary>

```http
GET    /api/reservations        # List reservations
POST   /api/reservations        # Create reservation
GET    /api/reservations/:id    # Get reservation details
PUT    /api/reservations/:id    # Update reservation
DELETE /api/reservations/:id    # Cancel reservation
GET    /api/amenities           # List available amenities
```
</details>

<details>
<summary><strong>💳 Payments</strong></summary>

```http
GET    /api/payments            # List payments
POST   /api/payments            # Process payment
GET    /api/payments/:id        # Get payment details
GET    /api/payments/pending    # Get pending payments
POST   /api/payments/:id/confirm # Confirm payment (admin)
```
</details>

<details>
<summary><strong>📢 Notifications</strong></summary>

```http
GET    /api/notifications       # List notifications
POST   /api/notifications       # Send notification (admin)
GET    /api/notifications/:id   # Get notification details
PUT    /api/notifications/:id/read # Mark as read
GET    /api/notifications/unread # Get unread notifications
```
</details>

### 📊 Response Format

All API responses follow this structure:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2025-06-27T10:30:00Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { ... }
  },
  "timestamp": "2025-06-27T10:30:00Z"
}
```

## 🗂️ Database Models

### 👥 User Management
| Model | Description | Key Features |
|-------|-------------|--------------|
| **User** | Core user accounts | Authentication, roles, profile data |
| **Profile** | Personal information | Contact details, emergency contacts |
| **Owner** | Property owners | Property ownership, pet registration |
| **Guard** | Security personnel | Shift schedules, access permissions |

### 🏢 Property Management  
| Model | Description | Key Features |
|-------|-------------|--------------|
| **Tower** | Building information | Name, address, total floors/units |
| **Apartment** | Individual units | Number, size, status, ownership |
| **ApartmentStatus** | Unit status tracking | Occupied, vacant, maintenance, etc. |

### 🚗 Parking & Vehicles
| Model | Description | Key Features |
|-------|-------------|--------------|
| **Parking** | Parking spaces | Location, type, availability |
| **VehicleType** | Vehicle classification | Car, motorcycle, bicycle |
| **ParkingStatus** | Real-time availability | Available, occupied, reserved |

### 💬 Communication
| Model | Description | Key Features |
|-------|-------------|--------------|
| **PQRS** | Complaints & requests | Category, priority, status tracking |
| **Notification** | System messages | Multi-channel delivery, read receipts |
| **Survey** | Feedback collection | Questions, responses, analytics |

### 💳 Financial
| Model | Description | Key Features |
|-------|-------------|--------------|
| **Payment** | Transaction records | Amount, status, payment method |
| **PaymentStatus** | Payment states | Pending, completed, failed, refunded |

### 🔐 Security & Access
| Model | Description | Key Features |
|-------|-------------|--------------|
| **Role** | User roles | Admin, owner, guard, resident |
| **Permission** | System permissions | CRUD operations, module access |
| **Module** | System features | Users, payments, reservations, etc. |

## 🔧 Development Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Populate database with sample data
npm run migrate    # Migrate data from MySQL to MongoDB
npm test           # Run tests (to be implemented)
```

## ⚡ Performance & Security

### 🚀 Performance Optimizations
- **Database Indexing**: Strategic indexes on frequently queried fields
- **Aggregation Pipelines**: Efficient complex queries and analytics
- **Connection Pooling**: Optimized MongoDB connection management
- **Caching Strategy**: Redis integration ready for session management
- **File Optimization**: Compressed uploads with size limits

### 🔐 Security Features
- **🔒 Authentication**: JWT-based with refresh token support
- **🛡️ Authorization**: Role-based access control (RBAC)
- **🔍 Input Validation**: Comprehensive Joi schema validation
- **📁 File Security**: Secure upload handling with type restrictions
- **🌐 CORS Protection**: Configurable cross-origin resource sharing
- **🛑 Rate Limiting**: API rate limiting to prevent abuse

### 📊 Monitoring & Analytics
- **📈 Performance Metrics**: Response time and throughput tracking
- **📋 Error Logging**: Comprehensive error tracking and reporting
- **👀 Audit Trail**: User action logging for security compliance
- **📱 Health Checks**: System health monitoring endpoints

## 🤔 Why Choose Valhalla?

### � Migration Ready
- **Seamless Transition**: Easy migration from legacy MySQL systems
- **Data Integrity**: Comprehensive validation during migration
- **Zero Downtime**: Phased migration approach available

### 🌍 Scalability
- **Horizontal Scaling**: MongoDB's natural scaling capabilities
- **Microservices Ready**: Modular architecture for service separation
- **Cloud Native**: Optimized for containerization and cloud deployment

### 👨‍� Developer Experience
- **Modern Stack**: Latest Node.js, Express, and MongoDB features
- **Rich Documentation**: Comprehensive API documentation
- **Testing Tools**: Built-in seeding and testing utilities
- **Development Tools**: Hot reload, debugging, and profiling ready

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🐛 Bug Reports
Found a bug? Please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node.js version, OS, etc.)

### ✨ Feature Requests
Have an idea for improvement? We'd love to hear it!
- Describe the feature and its benefits
- Provide use cases and examples
- Consider implementation complexity

### 🔧 Pull Requests

1. **Fork the repository**
   ```bash
   git fork https://github.com/yourusername/valhalla-mongodb.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-new-feature
   ```

3. **Make your changes**
   - Write clear, documented code
   - Add tests for new functionality
   - Update documentation as needed

4. **Commit with conventional format**
   ```bash
   git commit -m "feat: add amazing new feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/amazing-new-feature
   ```

### 📋 Development Guidelines
- Follow existing code style and patterns
- Write meaningful commit messages
- Include tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting

## � Deployment

### 🐳 Docker Deployment
```bash
# Build the image
docker build -t valhalla-mongodb .

# Run with environment variables
docker run -p 3000:3000 --env-file .env valhalla-mongodb
```

### ☁️ Cloud Deployment
Ready for deployment on:
- **Heroku**: Includes Procfile and configuration
- **AWS**: EC2, ECS, or Lambda deployment ready
- **Digital Ocean**: App Platform compatible
- **Vercel**: Serverless deployment supported

## 📞 Support & Community

### 💬 Getting Help
- **📚 Documentation**: Check this README and inline code comments
- **🐛 Issues**: Create a GitHub issue for bugs and feature requests
- **💡 Discussions**: Use GitHub Discussions for questions and ideas

### 🔗 Links
- **🌐 Website**: [Coming Soon]
- **📖 API Docs**: Available at `/api` when running
- **📊 Status Page**: [Coming Soon]

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### 🙏 Acknowledgments
- Built with ❤️ by the Valhalla development team
- Powered by [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), and [MongoDB](https://www.mongodb.com/)
- Icons by [Emoji](https://emojipedia.org/) and design inspiration from modern apartment management systems

---

<div align="center">

**🏢 Valhalla - Making apartment management simple and efficient**

[![Star on GitHub](https://img.shields.io/github/stars/yourusername/valhalla-mongodb.svg?style=social)](https://github.com/yourusername/valhalla-mongodb/stargazers)
[![Follow on GitHub](https://img.shields.io/github/followers/yourusername.svg?style=social&label=Follow)](https://github.com/yourusername)

Made with 💙 for the apartment management community

</div>
