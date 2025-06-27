import mongoose from 'mongoose';

// =====================================
// RESERVATIONS COLLECTION (Enhanced from reservation tables)
// =====================================
const reservationSchema = new mongoose.Schema({
  // Reservation type (embedded instead of reservation_type table)
  type: {
    type: String,
    required: [true, 'Reservation type is required'],
    enum: {
      values: ['pool', 'bbq_area', 'meeting_room', 'gym', 'party_room', 'playground', 'tennis_court', 'multipurpose_room'],
      message: 'Type must be a valid facility type'
    }
  },

  // Reservation status (embedded instead of reservation_status table)
  status: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show', 'in_progress'],
      message: 'Status must be: pending, confirmed, cancelled, completed, no_show, or in_progress'
    },
    default: 'pending'
  },

  // Date and time information
  reservationDate: {
    type: Date,
    required: [true, 'Reservation date is required'],
    validate: {
      validator: function(date) {
        return date >= new Date().setHours(0, 0, 0, 0); // Can't reserve in the past
      },
      message: 'Reservation date cannot be in the past'
    }
  },

  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },

  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function(endTime) {
        return endTime > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },

  // Duration in hours (computed)
  duration: {
    type: Number,
    min: 0.5, // Minimum 30 minutes
    max: 24   // Maximum 24 hours
  },

  // Description and purpose
  title: {
    type: String,
    required: [true, 'Reservation title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },

  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },

  // Event details
  eventType: {
    type: String,
    enum: ['birthday', 'meeting', 'exercise', 'family_gathering', 'business', 'celebration', 'other'],
    default: 'other'
  },

  // WHO made the reservation (owner/resident)
  reservedBy: {
    userId: {
      type: Number,
      required: [true, 'User ID is required']
    },
    userInfo: {
      fullName: {
        type: String,
        required: true
      },
      documentNumber: String,
      phone: {
        type: String,
        required: true
      },
      email: String,
      apartmentNumber: {
        type: String,
        required: true
      },
      towerName: String
    }
  },

  // Guest and attendee information
  attendees: {
    expectedCount: {
      type: Number,
      required: true,
      min: 1,
      max: 200
    },
    actualCount: {
      type: Number,
      min: 0
    },
    
    // Guest list for security
    guestList: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      documentNumber: String,
      phone: String,
      relationship: {
        type: String,
        enum: ['family', 'friend', 'business', 'service_provider', 'other']
      },
      checkedIn: {
        type: Boolean,
        default: false
      },
      checkedInAt: Date,
      checkedOutAt: Date
    }],

    // Age restrictions
    minAge: Number,
    maxAge: Number,
    childrenCount: { type: Number, default: 0 },
    adultCount: { type: Number, default: 0 }
  },

  // Equipment and services
  equipment: {
    requested: [{
      item: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1
      },
      cost: {
        type: Number,
        default: 0,
        min: 0
      }
    }],
    
    provided: [{
      item: String,
      quantity: Number,
      condition: {
        type: String,
        enum: ['good', 'fair', 'poor'],
        default: 'good'
      },
      returnedAt: Date,
      damages: String
    }]
  },

  // Additional services
  services: {
    catering: {
      requested: { type: Boolean, default: false },
      provider: String,
      cost: { type: Number, default: 0 },
      menuDetails: String
    },
    
    cleaning: {
      requested: { type: Boolean, default: false },
      provider: String,
      cost: { type: Number, default: 0 },
      specialRequirements: String
    },
    
    security: {
      requested: { type: Boolean, default: false },
      provider: String,
      cost: { type: Number, default: 0 },
      hours: Number
    },
    
    decoration: {
      requested: { type: Boolean, default: false },
      provider: String,
      cost: { type: Number, default: 0 },
      theme: String
    }
  },

  // Financial information
  cost: {
    baseFee: {
      type: Number,
      required: true,
      min: 0
    },
    equipmentFee: {
      type: Number,
      default: 0,
      min: 0
    },
    serviceFee: {
      type: Number,
      default: 0,
      min: 0
    },
    cleaningFee: {
      type: Number,
      default: 0,
      min: 0
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'COP'
    },
    
    // Payment tracking
    payment: {
      status: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'refunded'],
        default: 'pending'
      },
      method: {
        type: String,
        enum: ['cash', 'transfer', 'card', 'check', 'online']
      },
      transactionId: String,
      paidAmount: { type: Number, default: 0 },
      paidAt: Date,
      refundedAmount: { type: Number, default: 0 },
      refundedAt: Date,
      refundReason: String
    }
  },

  // Special requirements and rules
  requirements: {
    specialAccess: {
      type: Boolean,
      default: false
    },
    alcoholAllowed: {
      type: Boolean,
      default: false
    },
    musicAllowed: {
      type: Boolean,
      default: true
    },
    musicCutoffTime: {
      type: String,
      default: '22:00'
    },
    parkingRequired: {
      type: Boolean,
      default: false
    },
    parkingSpaces: {
      type: Number,
      default: 0
    }
  },

  // Approval workflow
  approval: {
    required: {
      type: Boolean,
      default: true
    },
    approvedBy: {
      userId: Number,
      fullName: String,
      role: String,
      notes: String
    },
    approvedAt: Date,
    rejectedBy: {
      userId: Number,
      fullName: String,
      role: String,
      reason: String
    },
    rejectedAt: Date
  },

  // Cancellation information
  cancellation: {
    cancelledBy: {
      userId: Number,
      fullName: String,
      role: String
    },
    cancelledAt: Date,
    reason: {
      type: String,
      enum: ['user_request', 'facility_unavailable', 'maintenance', 'emergency', 'policy_violation', 'weather', 'other']
    },
    notes: String,
    refundAmount: {
      type: Number,
      default: 0
    },
    cancellationFee: {
      type: Number,
      default: 0
    }
  },

  // Check-in/Check-out
  checkIn: {
    checkedInBy: {
      userId: Number,
      fullName: String,
      role: String
    },
    checkedInAt: Date,
    notes: String,
    facilityCondition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    }
  },

  checkOut: {
    checkedOutBy: {
      userId: Number,
      fullName: String,
      role: String
    },
    checkedOutAt: Date,
    notes: String,
    facilityCondition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor']
    },
    damages: [{
      description: String,
      severity: {
        type: String,
        enum: ['minor', 'moderate', 'major', 'severe']
      },
      cost: Number,
      photos: [String]
    }],
    cleaningRequired: {
      type: Boolean,
      default: false
    },
    cleaningNotes: String
  },

  // Recurring reservations
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly'],
      required: function() {
        return this.recurring.isRecurring;
      }
    },
    endDate: Date,
    occurrences: {
      type: Number,
      min: 1,
      max: 52
    },
    parentReservationId: mongoose.Schema.Types.ObjectId
  },

  // Communication and notifications
  notifications: {
    confirmation: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    },
    reminder: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      reminderTime: {
        type: Number,
        default: 24 // hours before
      }
    },
    followUp: {
      sent: { type: Boolean, default: false },
      sentAt: Date
    }
  },

  // Internal notes (for staff)
  internalNotes: [{
    note: {
      type: String,
      required: true
    },
    addedBy: {
      userId: Number,
      fullName: String,
      role: String
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: true
    }
  }],

  // Rating and feedback
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Feedback comment cannot exceed 500 characters']
    },
    wouldRecommend: Boolean,
    submittedAt: Date
  },

  // Metadata
  source: {
    type: String,
    enum: ['web', 'mobile', 'phone', 'walk_in', 'staff'],
    default: 'web'
  },

  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],

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
reservationSchema.index({ 'reservedBy.userId': 1, reservationDate: -1 });
reservationSchema.index({ type: 1, reservationDate: 1 });
reservationSchema.index({ status: 1, reservationDate: 1 });
reservationSchema.index({ reservationDate: 1, startTime: 1, endTime: 1 });
reservationSchema.index({ 'approval.required': 1, status: 1 });
reservationSchema.index({ 'recurring.parentReservationId': 1 });
reservationSchema.index({ createdAt: -1 });

// Compound index for conflict checking
reservationSchema.index({
  type: 1,
  reservationDate: 1,
  startTime: 1,
  endTime: 1,
  status: 1
});

// =====================================
// VIRTUAL FIELDS
// =====================================
reservationSchema.virtual('isUpcoming').get(function() {
  return this.startTime > new Date();
});

reservationSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.startTime <= now && this.endTime >= now && this.status === 'confirmed';
});

reservationSchema.virtual('isPast').get(function() {
  return this.endTime < new Date();
});

reservationSchema.virtual('canBeCancelled').get(function() {
  const hoursUntilStart = (this.startTime - new Date()) / (1000 * 60 * 60);
  return hoursUntilStart >= 24 && this.status === 'confirmed'; // 24 hours notice
});

// =====================================
// INSTANCE METHODS
// =====================================
reservationSchema.methods.approve = function(approvedBy, notes) {
  this.status = 'confirmed';
  this.approval.approvedBy = approvedBy;
  this.approval.approvedAt = new Date();
  if (notes) this.approval.approvedBy.notes = notes;
  
  return this.save();
};

reservationSchema.methods.reject = function(rejectedBy, reason) {
  this.status = 'cancelled';
  this.approval.rejectedBy = rejectedBy;
  this.approval.rejectedAt = new Date();
  this.approval.rejectedBy.reason = reason;
  
  return this.save();
};

reservationSchema.methods.cancel = function(cancelledBy, reason, notes) {
  this.status = 'cancelled';
  this.cancellation = {
    cancelledBy: cancelledBy,
    cancelledAt: new Date(),
    reason: reason,
    notes: notes
  };
  
  // Calculate refund if applicable
  const hoursUntilStart = (this.startTime - new Date()) / (1000 * 60 * 60);
  if (hoursUntilStart >= 48) {
    this.cancellation.refundAmount = this.cost.total; // Full refund
  } else if (hoursUntilStart >= 24) {
    this.cancellation.refundAmount = this.cost.total * 0.5; // 50% refund
    this.cancellation.cancellationFee = this.cost.total * 0.5;
  } else {
    this.cancellation.refundAmount = 0; // No refund
    this.cancellation.cancellationFee = this.cost.total;
  }
  
  return this.save();
};

reservationSchema.methods.performCheckIn = function(checkedInBy, notes, facilityCondition) {
  this.status = 'in_progress';
  this.checkIn = {
    checkedInBy: checkedInBy,
    checkedInAt: new Date(),
    notes: notes,
    facilityCondition: facilityCondition || 'good'
  };
  
  return this.save();
};

reservationSchema.methods.performCheckOut = function(checkedOutBy, notes, facilityCondition, damages) {
  this.status = 'completed';
  this.checkOut = {
    checkedOutBy: checkedOutBy,
    checkedOutAt: new Date(),
    notes: notes,
    facilityCondition: facilityCondition || 'good',
    damages: damages || []
  };
  
  return this.save();
};

reservationSchema.methods.addInternalNote = function(note, addedBy) {
  this.internalNotes.push({
    note: note,
    addedBy: addedBy,
    addedAt: new Date()
  });
  
  return this.save();
};

// =====================================
// STATIC METHODS
// =====================================
reservationSchema.statics.findConflicting = function(type, startTime, endTime, excludeId = null) {
  const query = {
    type: type,
    status: { $in: ['confirmed', 'in_progress'] },
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return this.find(query);
};

reservationSchema.statics.findByUser = function(userId) {
  return this.find({ 'reservedBy.userId': userId })
    .sort({ reservationDate: -1 });
};

reservationSchema.statics.findUpcoming = function(days = 7) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  return this.find({
    startTime: { $gte: new Date(), $lte: endDate },
    status: { $in: ['confirmed', 'pending'] }
  }).sort({ startTime: 1 });
};

reservationSchema.statics.findPendingApproval = function() {
  return this.find({
    status: 'pending',
    'approval.required': true
  }).sort({ createdAt: 1 });
};

reservationSchema.statics.getUtilizationStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        reservationDate: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$type',
        totalReservations: { $sum: 1 },
        totalHours: { $sum: '$duration' },
        avgAttendees: { $avg: '$attendees.actualCount' },
        totalRevenue: { $sum: '$cost.total' }
      }
    }
  ]);
};

// =====================================
// PRE-SAVE MIDDLEWARE
// =====================================
reservationSchema.pre('save', function(next) {
  // Calculate duration
  if (this.startTime && this.endTime) {
    this.duration = (this.endTime - this.startTime) / (1000 * 60 * 60); // hours
  }
  
  // Calculate total cost
  this.cost.total = (this.cost.baseFee || 0) + 
                   (this.cost.equipmentFee || 0) + 
                   (this.cost.serviceFee || 0) + 
                   (this.cost.cleaningFee || 0);
  
  next();
});

export default mongoose.model('Reservation', reservationSchema);
