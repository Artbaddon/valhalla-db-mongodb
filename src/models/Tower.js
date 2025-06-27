import mongoose from 'mongoose';

// =====================================
// TOWERS & APARTMENTS COLLECTION
// =====================================
const towerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tower name is required'],
    unique: true,
    trim: true,
    maxlength: [30, 'Tower name cannot exceed 30 characters']
  },

  // EMBEDDED APARTMENTS (replaces apartment table)
  apartments: [{
    number: {
      type: String,
      required: [true, 'Apartment number is required'],
      trim: true,
      maxlength: [4, 'Apartment number cannot exceed 4 characters']
    },

    // Apartment status (embedded instead of apartment_status table)
    status: {
      type: String,
      required: true,
      enum: {
        values: ['available', 'occupied', 'maintenance', 'reserved'],
        message: 'Status must be: available, occupied, maintenance, or reserved'
      },
      default: 'available'
    },

    // Owner information
    ownerId: {
      type: Number, // Reference to User (MySQL ID)
      required: false
    },

    ownerInfo: {
      fullName: String,
      documentNumber: String,
      phone: String,
      email: String
    },

    // Apartment details
    details: {
      bedrooms: {
        type: Number,
        min: 1,
        max: 10,
        default: 2
      },
      bathrooms: {
        type: Number,
        min: 1,
        max: 10,
        default: 2
      },
      area: {
        type: Number, // Square meters
        min: 20,
        max: 500
      },
      floor: {
        type: Number,
        min: 1,
        max: 50
      },
      balcony: {
        type: Boolean,
        default: false
      },
      parking: {
        hasParking: { type: Boolean, default: false },
        parkingNumber: String,
        parkingType: {
          type: String,
          enum: ['regular', 'covered', 'motorcycle'],
          default: 'regular'
        }
      }
    },

    // Financial information
    financial: {
      monthlyFee: {
        type: Number,
        min: 0,
        default: 0
      },
      administrationFee: {
        type: Number,
        min: 0,
        default: 0
      },
      lastPaymentDate: Date,
      paymentStatus: {
        type: String,
        enum: ['current', 'overdue', 'partial'],
        default: 'current'
      }
    },

    // Occupancy history
    occupancyHistory: [{
      ownerId: Number,
      ownerName: String,
      moveInDate: Date,
      moveOutDate: Date,
      reason: String,
      isTenant: { type: Boolean, default: false }
    }],

    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Tower details
  details: {
    totalFloors: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    apartmentsPerFloor: {
      type: Number,
      required: true,
      min: 1,
      max: 20
    },
    totalApartments: {
      type: Number,
      required: true
    },
    elevators: {
      type: Number,
      min: 0,
      max: 10,
      default: 1
    },
    emergencyStairs: {
      type: Number,
      min: 1,
      max: 5,
      default: 2
    }
  },

  // Amenities
  amenities: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true
    },
    floor: Number,
    capacity: Number,
    requiresReservation: {
      type: Boolean,
      default: false
    }
  }],

  // Tower status
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
towerSchema.index({ name: 1 }, { unique: true });
towerSchema.index({ 'apartments.number': 1, name: 1 });
towerSchema.index({ 'apartments.ownerId': 1 });
towerSchema.index({ 'apartments.status': 1 });

// =====================================
// VIRTUAL FIELDS
// =====================================
towerSchema.virtual('occupiedApartments').get(function() {
  return this.apartments.filter(apt => apt.status === 'occupied').length;
});

towerSchema.virtual('availableApartments').get(function() {
  return this.apartments.filter(apt => apt.status === 'available').length;
});

// =====================================
// INSTANCE METHODS
// =====================================
towerSchema.methods.addApartment = function(apartmentData) {
  this.apartments.push(apartmentData);
  return this.save();
};

towerSchema.methods.updateApartmentStatus = function(apartmentNumber, newStatus) {
  const apartment = this.apartments.find(apt => apt.number === apartmentNumber);
  if (apartment) {
    apartment.status = newStatus;
    apartment.updatedAt = new Date();
    return this.save();
  }
  throw new Error('Apartment not found');
};

towerSchema.methods.assignOwner = function(apartmentNumber, ownerData) {
  const apartment = this.apartments.find(apt => apt.number === apartmentNumber);
  if (apartment) {
    apartment.ownerId = ownerData.ownerId;
    apartment.ownerInfo = ownerData.ownerInfo;
    apartment.status = 'occupied';
    apartment.occupancyHistory.push({
      ownerId: ownerData.ownerId,
      ownerName: ownerData.ownerInfo.fullName,
      moveInDate: new Date(),
      isTenant: ownerData.isTenant || false
    });
    return this.save();
  }
  throw new Error('Apartment not found');
};

// =====================================
// STATIC METHODS
// =====================================
towerSchema.statics.findAvailableApartments = function() {
  return this.find({
    'apartments.status': 'available'
  }, {
    name: 1,
    'apartments.$': 1
  });
};

towerSchema.statics.findByOwner = function(ownerId) {
  return this.find({
    'apartments.ownerId': ownerId
  });
};

export default mongoose.model('Tower', towerSchema);
