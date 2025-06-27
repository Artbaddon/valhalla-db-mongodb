import mongoose from 'mongoose';

// =====================================
// NOTIFICATIONS COLLECTION
// =====================================
const notificationSchema = new mongoose.Schema({
  // Notification type (embedded instead of notification_type table)
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: {
      values: ['general', 'payment', 'maintenance', 'security', 'community', 'emergency', 'reservation', 'pqrs'],
      message: 'Type must be a valid notification type'
    }
  },

  // Notification content
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },

  description: {
    type: String,
    required: [true, 'Notification description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  // Rich content
  content: {
    html: String,
    attachments: [{
      filename: String,
      originalName: String,
      url: String,
      size: Number,
      mimetype: String
    }],
    images: [{
      url: String,
      caption: String,
      alt: String
    }]
  },

  // Target audience
  targetUserId: {
    type: Number, // Reference to User (MySQL ID)
    default: null // null means broadcast to all users
  },

  targetRole: {
    type: String,
    enum: ['admin', 'owner', 'guard', 'resident', 'maintenance', 'all'],
    default: 'all'
  },

  targetBuilding: {
    type: String,
    default: null // null means all buildings
  },

  targetApartments: [{
    type: String
  }],

  // Notification status and delivery
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'delivered', 'failed', 'cancelled'],
    default: 'draft'
  },

  isRead: {
    type: Boolean,
    default: false
  },

  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent', 'critical'],
      message: 'Priority must be: low, medium, high, urgent, or critical'
    },
    default: 'medium'
  },

  // Scheduling
  scheduledFor: {
    type: Date,
    default: null // null means send immediately
  },

  expiresAt: {
    type: Date,
    default: null // null means never expires
  },

  // Delivery channels
  channels: {
    inApp: {
      enabled: { type: Boolean, default: true },
      delivered: { type: Boolean, default: false },
      deliveredAt: Date
    },
    email: {
      enabled: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      emailId: String
    },
    sms: {
      enabled: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      smsId: String
    },
    push: {
      enabled: { type: Boolean, default: false },
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      pushId: String
    }
  },

  // Delivery tracking
  deliveryStats: {
    totalTargets: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    read: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  },

  // Individual delivery tracking
  recipients: [{
    userId: Number,
    userInfo: {
      fullName: String,
      email: String,
      phone: String,
      apartmentNumber: String
    },
    delivered: { type: Boolean, default: false },
    deliveredAt: Date,
    read: { type: Boolean, default: false },
    readAt: Date,
    clicked: { type: Boolean, default: false },
    clickedAt: Date,
    channel: {
      type: String,
      enum: ['in_app', 'email', 'sms', 'push']
    }
  }],

  // Action buttons
  actions: [{
    label: {
      type: String,
      required: true,
      maxlength: [50, 'Action label cannot exceed 50 characters']
    },
    url: String,
    action: {
      type: String,
      enum: ['link', 'payment', 'reservation', 'survey', 'contact', 'dismiss']
    },
    style: {
      type: String,
      enum: ['primary', 'secondary', 'success', 'warning', 'danger'],
      default: 'primary'
    },
    clickCount: { type: Number, default: 0 }
  }],

  // Additional metadata
  metadata: {
    sourceModule: {
      type: String,
      enum: ['admin', 'payments', 'reservations', 'pqrs', 'maintenance', 'security', 'system'],
      default: 'admin'
    },
    relatedEntityId: String,
    relatedEntityType: {
      type: String,
      enum: ['reservation', 'payment', 'pqrs', 'maintenance', 'user', 'apartment']
    },
    actionUrl: String,
    imageUrl: String,
    tags: [String]
  },

  // Notification settings
  settings: {
    allowReply: { type: Boolean, default: false },
    requireAcknowledgment: { type: Boolean, default: false },
    autoDelete: { type: Boolean, default: false },
    autoDeleteAfterDays: { type: Number, default: 30 },
    isImportant: { type: Boolean, default: false },
    isUrgent: { type: Boolean, default: false }
  },

  // Creator information
  createdBy: {
    userId: Number,
    fullName: String,
    role: String
  },

  // Approval workflow (for important notifications)
  approval: {
    required: { type: Boolean, default: false },
    approvedBy: {
      userId: Number,
      fullName: String,
      role: String
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

  // Template information
  template: {
    templateId: mongoose.Schema.Types.ObjectId,
    templateName: String,
    variables: mongoose.Schema.Types.Mixed
  },

  // Campaign information (for bulk notifications)
  campaign: {
    campaignId: mongoose.Schema.Types.ObjectId,
    campaignName: String,
    segmentId: String
  }

}, {
  timestamps: true
});

// =====================================
// INDEXES
// =====================================
notificationSchema.index({ targetUserId: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, priority: 1 });
notificationSchema.index({ scheduledFor: 1, status: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ targetRole: 1, createdAt: -1 });
notificationSchema.index({ 'metadata.sourceModule': 1 });
notificationSchema.index({ 'metadata.relatedEntityId': 1, 'metadata.relatedEntityType': 1 });
notificationSchema.index({ status: 1, createdAt: -1 });

// Text search index
notificationSchema.index({
  title: 'text',
  description: 'text'
});

// =====================================
// VIRTUAL FIELDS
// =====================================
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

notificationSchema.virtual('isBroadcast').get(function() {
  return this.targetUserId === null;
});

notificationSchema.virtual('isScheduled').get(function() {
  return this.scheduledFor && this.scheduledFor > new Date();
});

notificationSchema.virtual('deliveryRate').get(function() {
  if (this.deliveryStats.totalTargets === 0) return 0;
  return (this.deliveryStats.delivered / this.deliveryStats.totalTargets * 100).toFixed(2);
});

notificationSchema.virtual('readRate').get(function() {
  if (this.deliveryStats.delivered === 0) return 0;
  return (this.deliveryStats.read / this.deliveryStats.delivered * 100).toFixed(2);
});

// =====================================
// INSTANCE METHODS
// =====================================
notificationSchema.methods.markAsRead = function(userId = null, readAt = new Date()) {
  if (userId) {
    // Mark as read for specific user
    const recipient = this.recipients.find(r => r.userId === userId);
    if (recipient) {
      recipient.read = true;
      recipient.readAt = readAt;
      this.deliveryStats.read = this.recipients.filter(r => r.read).length;
    }
  } else {
    // Mark as read globally (for single-user notifications)
    this.isRead = true;
    this.readAt = readAt;
  }
  
  return this.save();
};

notificationSchema.methods.markAsClicked = function(userId, actionIndex = null) {
  const recipient = this.recipients.find(r => r.userId === userId);
  if (recipient) {
    recipient.clicked = true;
    recipient.clickedAt = new Date();
    this.deliveryStats.clicked = this.recipients.filter(r => r.clicked).length;
  }
  
  if (actionIndex !== null && this.actions[actionIndex]) {
    this.actions[actionIndex].clickCount += 1;
  }
  
  return this.save();
};

notificationSchema.methods.addRecipient = function(recipientData) {
  this.recipients.push(recipientData);
  this.deliveryStats.totalTargets = this.recipients.length;
  return this.save();
};

notificationSchema.methods.sendNow = function() {
  this.status = 'sent';
  this.scheduledFor = null; // Clear any scheduled time
  return this.save();
};

notificationSchema.methods.schedule = function(scheduledTime) {
  this.status = 'scheduled';
  this.scheduledFor = scheduledTime;
  return this.save();
};

notificationSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

// =====================================
// STATIC METHODS
// =====================================
notificationSchema.statics.findUnreadForUser = function(userId) {
  return this.find({
    $or: [
      { targetUserId: userId },
      { targetUserId: null } // Broadcast notifications
    ],
    $or: [
      { isRead: false },
      { 'recipients.userId': userId, 'recipients.read': false }
    ],
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ],
    status: { $in: ['sent', 'delivered'] }
  }).sort({ createdAt: -1 });
};

notificationSchema.statics.findByPriority = function(priority) {
  return this.find({ 
    priority: priority,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ],
    status: { $in: ['sent', 'delivered'] }
  }).sort({ createdAt: -1 });
};

notificationSchema.statics.findScheduled = function() {
  return this.find({
    status: 'scheduled',
    scheduledFor: { $lte: new Date() }
  }).sort({ scheduledFor: 1 });
};

notificationSchema.statics.findExpired = function() {
  return this.find({
    expiresAt: { $lte: new Date() },
    status: { $in: ['sent', 'delivered'] }
  });
};

notificationSchema.statics.getStatistics = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgDeliveryRate: { $avg: { $divide: ['$deliveryStats.delivered', '$deliveryStats.totalTargets'] } },
        avgReadRate: { $avg: { $divide: ['$deliveryStats.read', '$deliveryStats.delivered'] } },
        totalClicks: { $sum: '$deliveryStats.clicked' }
      }
    }
  ]);
};

// =====================================
// PRE-SAVE MIDDLEWARE
// =====================================
notificationSchema.pre('save', function(next) {
  // Auto-set expiry for certain types if not set
  if (this.isNew && !this.expiresAt) {
    const expiryDays = {
      emergency: 1,
      security: 3,
      maintenance: 7,
      payment: 30,
      general: 30,
      community: 60
    };
    
    if (expiryDays[this.type]) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + expiryDays[this.type]);
      this.expiresAt = expiry;
    }
  }
  
  // Set urgent flag based on priority
  if (this.priority === 'urgent' || this.priority === 'critical') {
    this.settings.isUrgent = true;
  }
  
  next();
});

export default mongoose.model('Notification', notificationSchema);
