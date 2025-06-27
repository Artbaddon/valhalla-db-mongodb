import mongoose from 'mongoose';

// =====================================
// PARKING COLLECTION (Enhanced from parking table)
// =====================================
const parkingSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'Parking number is required'],
    unique: true,
    trim: true,
    maxlength: [5, 'Parking number cannot exceed 5 characters']
  },

  // Parking status (embedded instead of parking_status table)
  status: {
    type: String,
    required: true,
    enum: {
      values: ['available', 'occupied', 'reserved', 'maintenance', 'out_of_service'],
      message: 'Status must be: available, occupied, reserved, maintenance, or out_of_service'
    },
    default: 'available'
  },

  // Parking type (embedded instead of parking_type table)
  type: {
    type: String,
    required: true,
    enum: {
      values: ['regular', 'covered', 'motorcycle', 'disabled', 'visitor', 'electric'],
      message: 'Type must be: regular, covered, motorcycle, disabled, visitor, or electric'
    },
    default: 'regular'
  },

  // Owner/User assignment
  assignedUserId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to User MongoDB ObjectId
    ref: 'User',
    required: false
  },

  assignedUserInfo: {
    fullName: String,
    documentNumber: String,
    phone: String,
    apartmentNumber: String,
    towerName: String
  },

  // EMBEDDED VEHICLE INFO (enhanced from vehicle_type table)
  vehicle: {
    type: {
      type: String,
      enum: ['car', 'motorcycle', 'truck', 'van', 'suv', 'bicycle'],
      required: function() {
        return this.parent().status === 'occupied';
      }
    },
    
    plate: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [10, 'License plate cannot exceed 10 characters'],
      required: function() {
        return this.parent().status === 'occupied';
      }
    },
    
    brand: {
      type: String,
      trim: true,
      maxlength: [30, 'Brand cannot exceed 30 characters']
    },
    
    model: {
      type: String,
      trim: true,
      maxlength: [30, 'Model cannot exceed 30 characters']
    },
    
    year: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear() + 2
    },
    
    color: {
      type: String,
      trim: true,
      maxlength: [20, 'Color cannot exceed 20 characters']
    },
    
    engineCC: {
      type: String,
      trim: true,
      maxlength: [30, 'Engine CC cannot exceed 30 characters']
    },

    // Vehicle documents
    documents: {
      soat: {
        number: String,
        expiryDate: Date,
        isValid: { type: Boolean, default: true }
      },
      technicalReview: {
        number: String,
        expiryDate: Date,
        isValid: { type: Boolean, default: true }
      },
      registration: {
        number: String,
        expiryDate: Date,
        isValid: { type: Boolean, default: true }
      }
    }
  },

  // Parking details
  details: {
    floor: {
      type: Number,
      required: true,
      min: -5, // Basement levels
      max: 10
    },
    
    section: {
      type: String,
      trim: true,
      maxlength: [5, 'Section cannot exceed 5 characters']
    },
    
    dimensions: {
      length: { type: Number, min: 2, max: 10 }, // meters
      width: { type: Number, min: 1.5, max: 5 }, // meters
      height: { type: Number, min: 1.8, max: 3 } // meters
    },

    hasElectricCharging: {
      type: Boolean,
      default: false
    },

    hasCover: {
      type: Boolean,
      default: false
    },

    hasStorage: {
      type: Boolean,
      default: false
    },

    securityLevel: {
      type: String,
      enum: ['basic', 'medium', 'high'],
      default: 'basic'
    }
  },

  // Reservation system
  reservations: [{
    userId: Number,
    userInfo: {
      fullName: String,
      phone: String,
      apartmentNumber: String
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    purpose: {
      type: String,
      enum: ['visitor', 'maintenance', 'moving', 'event', 'temporary'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Usage history
  usageHistory: [{
    userId: Number,
    userInfo: {
      fullName: String,
      apartmentNumber: String
    },
    vehicle: {
      type: String,
      plate: String,
      brand: String,
      model: String
    },
    assignedDate: Date,
    unassignedDate: Date,
    reason: String,
    notes: String
  }],

  // Maintenance records
  maintenance: [{
    type: {
      type: String,
      enum: ['cleaning', 'repair', 'painting', 'electrical', 'security', 'other'],
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    performedBy: {
      name: String,
      company: String,
      phone: String
    },
    cost: {
      type: Number,
      min: 0
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Monthly fee
  monthlyFee: {
    type: Number,
    min: 0,
    default: 0
  },

  // Notes and observations
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

// =====================================
// INDEXES
// =====================================
parkingSchema.index({ number: 1 }, { unique: true });
parkingSchema.index({ assignedUserId: 1 });
parkingSchema.index({ status: 1, type: 1 });
parkingSchema.index({ 'vehicle.plate': 1 });
parkingSchema.index({ 'details.floor': 1, 'details.section': 1 });
parkingSchema.index({ isActive: 1, status: 1 });

// =====================================
// VIRTUAL FIELDS
// =====================================
parkingSchema.virtual('isOccupied').get(function() {
  return this.status === 'occupied';
});

parkingSchema.virtual('isAvailable').get(function() {
  return this.status === 'available';
});

parkingSchema.virtual('currentReservation').get(function() {
  const now = new Date();
  return this.reservations.find(res => 
    res.status === 'approved' && 
    res.startDate <= now && 
    res.endDate >= now
  );
});

// =====================================
// INSTANCE METHODS
// =====================================
parkingSchema.methods.assignToUser = function(userId, userInfo, vehicleInfo) {
  if (this.status !== 'available') {
    throw new Error('Parking space is not available');
  }

  this.assignedUserId = userId;
  this.assignedUserInfo = userInfo;
  this.vehicle = vehicleInfo;
  this.status = 'occupied';

  // Add to usage history
  this.usageHistory.push({
    userId: userId,
    userInfo: userInfo,
    vehicle: vehicleInfo,
    assignedDate: new Date()
  });

  return this.save();
};

parkingSchema.methods.unassignFromUser = function(reason, notes) {
  if (this.status !== 'occupied') {
    throw new Error('Parking space is not occupied');
  }

  // Update last usage history entry
  const lastUsage = this.usageHistory[this.usageHistory.length - 1];
  if (lastUsage && !lastUsage.unassignedDate) {
    lastUsage.unassignedDate = new Date();
    lastUsage.reason = reason;
    lastUsage.notes = notes;
  }

  this.assignedUserId = null;
  this.assignedUserInfo = {};
  this.vehicle = {};
  this.status = 'available';

  return this.save();
};

parkingSchema.methods.createReservation = function(reservationData) {
  // Check for conflicting reservations
  const conflicts = this.reservations.filter(res => 
    res.status === 'approved' &&
    ((reservationData.startDate >= res.startDate && reservationData.startDate <= res.endDate) ||
     (reservationData.endDate >= res.startDate && reservationData.endDate <= res.endDate))
  );

  if (conflicts.length > 0) {
    throw new Error('Parking space is already reserved for this time period');
  }

  this.reservations.push(reservationData);
  return this.save();
};

parkingSchema.methods.addMaintenanceRecord = function(maintenanceData) {
  this.maintenance.push(maintenanceData);
  
  // If maintenance is starting, update status
  if (maintenanceData.status === 'in_progress') {
    this.status = 'maintenance';
  }
  
  return this.save();
};

// =====================================
// STATIC METHODS
// =====================================
parkingSchema.statics.findAvailable = function(type = null) {
  const query = { status: 'available', isActive: true };
  if (type) query.type = type;
  return this.find(query);
};

parkingSchema.statics.findByUser = function(userId) {
  return this.find({ assignedUserId: userId });
};

parkingSchema.statics.findByFloor = function(floor) {
  return this.find({ 'details.floor': floor, isActive: true });
};

parkingSchema.statics.getOccupancyStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

export default mongoose.model('Parking', parkingSchema);
