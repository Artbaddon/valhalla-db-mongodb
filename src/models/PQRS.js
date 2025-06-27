import mongoose from 'mongoose';

// =====================================
// PQRS COLLECTION (Enhanced from pqrs + pqrs_tracking + pqrs_category)
// =====================================
const pqrsSchema = new mongoose.Schema({
  // PQRS category (embedded instead of pqrs_category table)
  category: {
    type: String,
    required: [true, 'PQRS category is required'],
    enum: {
      values: ['peticion', 'queja', 'reclamo', 'sugerencia'],
      message: 'Category must be: peticion, queja, reclamo, or sugerencia'
    }
  },

  // Main content
  title: {
    type: String,
    required: [true, 'PQRS title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },

  description: {
    type: String,
    required: [true, 'PQRS description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },

  // Multiple file attachments
  files: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Response from administration
  answer: {
    content: {
      type: String,
      maxlength: [2000, 'Answer cannot exceed 2000 characters']
    },
    answeredBy: {
      userId: Number,
      fullName: String,
      role: String
    },
    answeredAt: Date,
    files: [{
      filename: String,
      originalName: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }]
  },

  // WHO created this PQRS
  createdBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    userInfo: {
      fullName: {
        type: String,
        required: true
      },
      documentNumber: String,
      phone: String,
      email: String,
      apartmentNumber: String,
      towerName: String
    },
    submissionMethod: {
      type: String,
      enum: ['web', 'mobile', 'email', 'physical', 'phone'],
      default: 'web'
    }
  },

  // EMBEDDED TRACKING (replaces pqrs_tracking table)
  tracking: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    
    userId: {
      type: Number,
      required: true
    },
    
    userInfo: {
      fullName: String,
      role: String
    },
    
    // Status (embedded instead of pqrs_tracking_status table)
    status: {
      type: String,
      required: true,
      enum: {
        values: ['received', 'in_review', 'in_progress', 'pending_info', 'resolved', 'closed', 'rejected'],
        message: 'Status must be: received, in_review, in_progress, pending_info, resolved, closed, or rejected'
      }
    },
    
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    
    internalNotes: {
      type: String,
      maxlength: [1000, 'Internal notes cannot exceed 1000 characters']
    },
    
    estimatedResolutionDate: Date,
    
    attachments: [{
      filename: String,
      originalName: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    
    dateUpdate: {
      type: Date,
      default: Date.now
    }
  }],

  // Current status (denormalized for fast queries)
  currentStatus: {
    type: String,
    enum: ['received', 'in_review', 'in_progress', 'pending_info', 'resolved', 'closed', 'rejected'],
    default: 'received'
  },

  // Priority level
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent', 'critical'],
      message: 'Priority must be: low, medium, high, urgent, or critical'
    },
    default: 'medium'
  },

  // Department assignment
  assignedTo: {
    department: {
      type: String,
      enum: ['administration', 'maintenance', 'security', 'cleaning', 'legal', 'finance'],
      default: 'administration'
    },
    userId: Number,
    fullName: String,
    assignedAt: Date
  },

  // Resolution information
  resolution: {
    resolvedBy: {
      userId: Number,
      fullName: String,
      role: String
    },
    resolvedAt: Date,
    resolutionType: {
      type: String,
      enum: ['solved', 'workaround', 'no_action_needed', 'duplicate', 'invalid']
    },
    
    // User satisfaction
    satisfaction: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      feedback: {
        type: String,
        maxlength: [500, 'Feedback cannot exceed 500 characters']
      },
      submittedAt: Date
    },
    
    followUpRequired: {
      type: Boolean,
      default: false
    },
    
    followUpDate: Date
  },

  // SLA (Service Level Agreement) tracking
  sla: {
    acknowledgeBy: {
      type: Date,
      required: true
    },
    respondBy: {
      type: Date,
      required: true
    },
    resolveBy: {
      type: Date,
      required: true
    },
    acknowledgedAt: Date,
    respondedAt: Date,
    isAcknowledgeBreached: { type: Boolean, default: false },
    isResponseBreached: { type: Boolean, default: false },
    isResolutionBreached: { type: Boolean, default: false }
  },

  // Communication history
  communications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'call', 'meeting', 'notification'],
      required: true
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true
    },
    content: String,
    sentBy: {
      userId: Number,
      fullName: String
    },
    sentTo: {
      userId: Number,
      fullName: String,
      contact: String // email or phone
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent'
    }
  }],

  // Related PQRSs
  relatedPQRS: [{
    pqrsId: mongoose.Schema.Types.ObjectId,
    relationship: {
      type: String,
      enum: ['duplicate', 'related', 'follow_up', 'escalation']
    },
    notes: String
  }],

  // Tags for better organization
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],

  // Auto-close settings
  autoCloseAfterResolution: {
    type: Number,
    default: 7 // days
  },

  // Notification preferences
  notifications: {
    emailUpdates: { type: Boolean, default: true },
    smsUpdates: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: true }
  },

  // Visibility
  isPublic: {
    type: Boolean,
    default: false
  },

  isAnonymous: {
    type: Boolean,
    default: false
  },

  // Archive flag
  isArchived: {
    type: Boolean,
    default: false
  },

  archivedAt: Date,
  archivedBy: {
    userId: Number,
    fullName: String
  }

}, {
  timestamps: true
});

// =====================================
// INDEXES
// =====================================
pqrsSchema.index({ 'createdBy.userId': 1, createdAt: -1 });
pqrsSchema.index({ currentStatus: 1, createdAt: -1 });
pqrsSchema.index({ category: 1, currentStatus: 1 });
pqrsSchema.index({ priority: 1, currentStatus: 1 });
pqrsSchema.index({ 'assignedTo.department': 1, currentStatus: 1 });
pqrsSchema.index({ 'assignedTo.userId': 1 });
pqrsSchema.index({ 'sla.resolveBy': 1, currentStatus: 1 });
pqrsSchema.index({ tags: 1 });
pqrsSchema.index({ isArchived: 1, createdAt: -1 });

// Text search index
pqrsSchema.index({
  title: 'text',
  description: 'text',
  'answer.content': 'text',
  'tracking.comment': 'text'
});

// =====================================
// VIRTUAL FIELDS
// =====================================
pqrsSchema.virtual('isOverdue').get(function() {
  if (this.currentStatus === 'resolved' || this.currentStatus === 'closed') {
    return false;
  }
  return new Date() > this.sla.resolveBy;
});

pqrsSchema.virtual('daysOpen').get(function() {
  const end = this.resolution?.resolvedAt || new Date();
  return Math.ceil((end - this.createdAt) / (1000 * 60 * 60 * 24));
});

pqrsSchema.virtual('lastUpdate').get(function() {
  if (this.tracking.length === 0) return this.createdAt;
  return this.tracking[this.tracking.length - 1].dateUpdate;
});

// =====================================
// INSTANCE METHODS
// =====================================
pqrsSchema.methods.addTracking = function(trackingData) {
  this.tracking.push(trackingData);
  this.currentStatus = trackingData.status;
  
  // Update SLA tracking
  if (trackingData.status === 'in_review' && !this.sla.acknowledgedAt) {
    this.sla.acknowledgedAt = new Date();
  }
  
  if (this.answer && !this.sla.respondedAt) {
    this.sla.respondedAt = new Date();
  }
  
  if (trackingData.status === 'resolved' && !this.resolution.resolvedAt) {
    this.resolution.resolvedAt = new Date();
    this.resolution.resolvedBy = {
      userId: trackingData.userId,
      fullName: trackingData.userInfo.fullName,
      role: trackingData.userInfo.role
    };
  }
  
  return this.save();
};

pqrsSchema.methods.addAnswer = function(answerData) {
  this.answer = answerData;
  
  if (!this.sla.respondedAt) {
    this.sla.respondedAt = new Date();
  }
  
  return this.save();
};

pqrsSchema.methods.assignTo = function(departmentOrUser) {
  this.assignedTo = {
    ...departmentOrUser,
    assignedAt: new Date()
  };
  
  return this.save();
};

pqrsSchema.methods.addCommunication = function(communicationData) {
  this.communications.push(communicationData);
  return this.save();
};

pqrsSchema.methods.close = function(resolutionData) {
  this.currentStatus = 'closed';
  this.resolution = {
    ...this.resolution,
    ...resolutionData,
    resolvedAt: this.resolution.resolvedAt || new Date()
  };
  
  // Add final tracking entry
  this.tracking.push({
    userId: resolutionData.resolvedBy?.userId || 0,
    userInfo: {
      fullName: resolutionData.resolvedBy?.fullName || 'System',
      role: resolutionData.resolvedBy?.role || 'system'
    },
    status: 'closed',
    comment: 'PQRS closed',
    dateUpdate: new Date()
  });
  
  return this.save();
};

// =====================================
// STATIC METHODS
// =====================================
pqrsSchema.statics.findByUser = function(userId) {
  return this.find({ 'createdBy.userId': userId })
    .sort({ createdAt: -1 });
};

pqrsSchema.statics.findByStatus = function(status) {
  return this.find({ currentStatus: status })
    .sort({ createdAt: -1 });
};

pqrsSchema.statics.findOverdue = function() {
  return this.find({
    currentStatus: { $nin: ['resolved', 'closed'] },
    'sla.resolveBy': { $lt: new Date() }
  }).sort({ 'sla.resolveBy': 1 });
};

pqrsSchema.statics.findByDepartment = function(department) {
  return this.find({ 'assignedTo.department': department })
    .sort({ priority: -1, createdAt: -1 });
};

pqrsSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$currentStatus',
        count: { $sum: 1 },
        avgDaysOpen: {
          $avg: {
            $divide: [
              { $subtract: [new Date(), '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      }
    }
  ]);
};

// =====================================
// PRE-SAVE MIDDLEWARE
// =====================================
pqrsSchema.pre('save', function(next) {
  // Set SLA dates based on priority
  if (this.isNew) {
    const now = new Date();
    const slaHours = {
      critical: { acknowledge: 1, respond: 4, resolve: 24 },
      urgent: { acknowledge: 2, respond: 8, resolve: 72 },
      high: { acknowledge: 4, respond: 24, resolve: 168 },
      medium: { acknowledge: 8, respond: 48, resolve: 336 },
      low: { acknowledge: 24, respond: 120, resolve: 720 }
    };
    
    const sla = slaHours[this.priority];
    this.sla.acknowledgeBy = new Date(now.getTime() + sla.acknowledge * 60 * 60 * 1000);
    this.sla.respondBy = new Date(now.getTime() + sla.respond * 60 * 60 * 1000);
    this.sla.resolveBy = new Date(now.getTime() + sla.resolve * 60 * 60 * 1000);
  }
  
  // Check for SLA breaches
  const now = new Date();
  if (!this.sla.acknowledgedAt && now > this.sla.acknowledgeBy) {
    this.sla.isAcknowledgeBreached = true;
  }
  if (!this.sla.respondedAt && now > this.sla.respondBy) {
    this.sla.isResponseBreached = true;
  }
  if (!this.resolution.resolvedAt && now > this.sla.resolveBy) {
    this.sla.isResolutionBreached = true;
  }
  
  next();
});

export default mongoose.model('PQRS', pqrsSchema);
