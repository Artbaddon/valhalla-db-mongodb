import mongoose from 'mongoose';

// =====================================
// SURVEYS COLLECTION (Enhanced from survey + questions + question_type)
// =====================================
const surveySchema = new mongoose.Schema({
  // Basic survey information
  name: {
    type: String,
    required: [true, 'Survey name is required'],
    trim: true,
    maxlength: [100, 'Survey name cannot exceed 100 characters']
  },

  title: {
    type: String,
    required: [true, 'Survey title is required'],
    trim: true,
    maxlength: [200, 'Survey title cannot exceed 200 characters']
  },

  description: {
    type: String,
    required: [true, 'Survey description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  // Survey type and purpose
  category: {
    type: String,
    required: true,
    enum: {
      values: ['satisfaction', 'feedback', 'opinion', 'evaluation', 'research', 'poll', 'census'],
      message: 'Category must be a valid survey type'
    }
  },

  purpose: {
    type: String,
    maxlength: [500, 'Purpose cannot exceed 500 characters']
  },

  // EMBEDDED QUESTIONS (replaces questions + question_type tables)
  questions: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    
    // Question type (embedded instead of question_type table)
    type: {
      type: String,
      required: true,
      enum: {
        values: ['text', 'textarea', 'multiple_choice', 'single_choice', 'rating', 'scale', 'yes_no', 'date', 'number', 'email', 'phone', 'matrix', 'ranking'],
        message: 'Question type must be valid'
      }
    },

    title: {
      type: String,
      required: [true, 'Question title is required'],
      trim: true,
      maxlength: [200, 'Question title cannot exceed 200 characters']
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Question description cannot exceed 500 characters']
    },

    // Question configuration
    config: {
      // For multiple choice, single choice, ranking
      options: [{
        value: { type: String, required: true },
        label: { type: String, required: true },
        order: { type: Number, default: 0 }
      }],

      // For rating and scale questions
      scale: {
        min: { type: Number, default: 1 },
        max: { type: Number, default: 5 },
        minLabel: String,
        maxLabel: String,
        step: { type: Number, default: 1 }
      },

      // For matrix questions
      rows: [{
        value: String,
        label: String
      }],
      
      columns: [{
        value: String,
        label: String
      }],

      // Validation rules
      validation: {
        required: { type: Boolean, default: false },
        minLength: Number,
        maxLength: Number,
        min: Number,
        max: Number,
        pattern: String,
        customMessage: String
      },

      // Display settings
      display: {
        randomizeOptions: { type: Boolean, default: false },
        showOtherOption: { type: Boolean, default: false },
        otherOptionLabel: { type: String, default: 'Other' },
        allowMultipleLines: { type: Boolean, default: false },
        placeholder: String
      }
    },

    // Question logic
    logic: {
      // Conditional display
      showIf: {
        questionId: mongoose.Schema.Types.ObjectId,
        operator: {
          type: String,
          enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than']
        },
        value: mongoose.Schema.Types.Mixed
      },

      // Skip logic
      skipTo: {
        questionId: mongoose.Schema.Types.ObjectId,
        condition: {
          operator: String,
          value: mongoose.Schema.Types.Mixed
        }
      }
    },

    // Question order and grouping
    order: {
      type: Number,
      required: true,
      default: 0
    },

    section: {
      type: String,
      trim: true
    },

    page: {
      type: Number,
      default: 1
    },

    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // EMBEDDED RESPONSES (replaces separate responses table)
  responses: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    
    // Respondent information
    respondent: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
      }, // Reference to User ObjectId (consistent with PQRS)
      userInfo: {
        fullName: String,
        email: String,
        phone: String,
        apartmentNumber: String,
        towerName: String,
        demographicInfo: mongoose.Schema.Types.Mixed
      },
      isAnonymous: { type: Boolean, default: false }
    },

    // Answers to questions
    answers: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      answer: mongoose.Schema.Types.Mixed, // Can be string, number, array, object
      
      // Additional answer metadata
      metadata: {
        timeSpent: Number, // seconds
        changedCount: { type: Number, default: 0 },
        skipped: { type: Boolean, default: false },
        otherText: String // for "other" option
      }
    }],

    // Response session info
    session: {
      startedAt: {
        type: Date,
        default: Date.now
      },
      submittedAt: Date,
      completedAt: Date,
      timeSpent: Number, // total time in seconds
      
      // Device and browser info
      userAgent: String,
      ipAddress: String,
      device: {
        type: String,
        enum: ['desktop', 'tablet', 'mobile']
      },
      
      // Progress tracking
      currentPage: { type: Number, default: 1 },
      totalPages: Number,
      progressPercent: { type: Number, default: 0 },
      
      // Status
      status: {
        type: String,
        enum: ['started', 'in_progress', 'paused', 'completed', 'abandoned'],
        default: 'started'
      }
    },

    // Quality indicators
    quality: {
      completionRate: Number, // percentage of required questions answered
      straightLining: { type: Boolean, default: false }, // same answer to multiple questions
      speedingFlag: { type: Boolean, default: false }, // answered too quickly
      inconsistencies: [String], // list of detected inconsistencies
      qualityScore: { type: Number, min: 0, max: 100 }
    },

    // Follow-up information
    followUp: {
      contactPermission: { type: Boolean, default: false },
      preferredContact: {
        type: String,
        enum: ['email', 'phone', 'sms', 'in_person']
      },
      bestTimeToContact: String,
      additionalComments: String
    }
  }],

  // Survey settings and configuration
  settings: {
    // Access control
    access: {
      type: {
        type: String,
        enum: ['public', 'private', 'restricted'],
        default: 'restricted'
      },
      password: String,
      allowedRoles: [{
        type: String,
        enum: ['admin', 'owner', 'guard', 'resident', 'maintenance']
      }],
      allowedUsers: [Number], // specific user IDs
      allowedBuildings: [String]
    },

    // Response settings
    responses: {
      allowMultiple: { type: Boolean, default: false },
      allowEditing: { type: Boolean, default: false },
      editTimeLimit: Number, // hours
      requireLogin: { type: Boolean, default: true },
      allowAnonymous: { type: Boolean, default: false },
      maxResponses: Number,
      responsesPerUser: { type: Number, default: 1 }
    },

    // Display settings
    display: {
      showProgressBar: { type: Boolean, default: true },
      showQuestionNumbers: { type: Boolean, default: true },
      questionsPerPage: { type: Number, default: 5 },
      randomizeQuestions: { type: Boolean, default: false },
      theme: {
        type: String,
        enum: ['default', 'modern', 'classic', 'minimal'],
        default: 'default'
      },
      customCss: String,
      logo: String,
      backgroundColor: String,
      textColor: String
    },

    // Notification settings
    notifications: {
      sendConfirmation: { type: Boolean, default: true },
      sendReminders: { type: Boolean, default: false },
      reminderSchedule: [Number], // days before deadline
      notifyOnResponse: { type: Boolean, default: false },
      notificationEmails: [String]
    },

    // Survey flow
    flow: {
      welcomeMessage: String,
      thankYouMessage: String,
      redirectUrl: String,
      allowBackButton: { type: Boolean, default: true },
      autoAdvance: { type: Boolean, default: false },
      timePerPage: Number // seconds
    }
  },

  // Survey lifecycle
  lifecycle: {
    status: {
      type: String,
      enum: ['draft', 'testing', 'active', 'paused', 'completed', 'closed', 'archived'],
      default: 'draft'
    },

    // Publishing information
    publishedAt: Date,
    publishedBy: {
      userId: Number,
      fullName: String,
      role: String
    },

    // Scheduling
    startsAt: Date,
    endsAt: Date,
    
    // Target information
    targetAudience: {
      description: String,
      estimatedSize: Number,
      actualSize: Number,
      criteria: mongoose.Schema.Types.Mixed
    }
  },

  // Analytics and statistics
  analytics: {
    // Response statistics
    totalResponses: { type: Number, default: 0 },
    completedResponses: { type: Number, default: 0 },
    partialResponses: { type: Number, default: 0 },
    abandonedResponses: { type: Number, default: 0 },
    
    // Completion rate
    completionRate: { type: Number, default: 0 }, // percentage
    averageTimeToComplete: Number, // seconds
    
    // Response distribution over time
    responsesPerDay: [{
      date: Date,
      count: Number
    }],
    
    // Quality metrics
    averageQualityScore: Number,
    qualityFlags: {
      straightLining: Number,
      speeding: Number,
      inconsistencies: Number
    },

    // Last calculated
    lastCalculated: { type: Date, default: Date.now }
  },

  // Survey metadata
  metadata: {
    version: { type: Number, default: 1 },
    originalSurveyId: mongoose.Schema.Types.ObjectId, // for survey copies
    tags: [String],
    department: String,
    cost: Number,
    budget: Number,
    
    // External integrations
    integrations: {
      exportToExcel: { type: Boolean, default: false },
      exportToPDF: { type: Boolean, default: false },
      webhookUrl: String,
      apiCallbacks: [String]
    }
  },

  // Creator and ownership
  createdBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    userInfo: {
      fullName: String,
      role: String,
      department: String
    }
  },

  // Collaboration
  collaborators: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userInfo: {
      fullName: String,
      role: String
    },
    permissions: [{
      type: String,
      enum: ['view', 'edit', 'manage_responses', 'publish', 'delete']
    }],
    addedAt: { type: Date, default: Date.now }
  }],

  // Archive information
  isArchived: { type: Boolean, default: false },
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
surveySchema.index({ 'lifecycle.status': 1, createdAt: -1 });
surveySchema.index({ 'createdBy.userId': 1, createdAt: -1 });
surveySchema.index({ 'responses.respondent.userId': 1 });
surveySchema.index({ category: 1, 'lifecycle.status': 1 });
surveySchema.index({ 'lifecycle.startsAt': 1, 'lifecycle.endsAt': 1 });
surveySchema.index({ 'metadata.tags': 1 });
surveySchema.index({ isArchived: 1, createdAt: -1 });

// Text search index
surveySchema.index({
  name: 'text',
  title: 'text',
  description: 'text',
  'questions.title': 'text'
});

// =====================================
// VIRTUAL FIELDS
// =====================================
surveySchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.lifecycle.status === 'active' &&
         (!this.lifecycle.startsAt || this.lifecycle.startsAt <= now) &&
         (!this.lifecycle.endsAt || this.lifecycle.endsAt >= now);
});

surveySchema.virtual('responseRate').get(function() {
  if (!this.lifecycle.targetAudience.actualSize) return 0;
  return (this.analytics.totalResponses / this.lifecycle.targetAudience.actualSize * 100).toFixed(2);
});

surveySchema.virtual('averageCompletionTime').get(function() {
  if (!this.analytics.averageTimeToComplete) return 0;
  return Math.round(this.analytics.averageTimeToComplete / 60); // minutes
});

// =====================================
// INSTANCE METHODS
// =====================================
surveySchema.methods.addResponse = function(responseData) {
  this.responses.push(responseData);
  this.analytics.totalResponses += 1;
  
  if (responseData.session.status === 'completed') {
    this.analytics.completedResponses += 1;
  }
  
  this.updateAnalytics();
  return this.save();
};

surveySchema.methods.updateAnalytics = function() {
  const completed = this.responses.filter(r => r.session.status === 'completed');
  const partial = this.responses.filter(r => r.session.status === 'in_progress');
  const abandoned = this.responses.filter(r => r.session.status === 'abandoned');
  
  this.analytics.completedResponses = completed.length;
  this.analytics.partialResponses = partial.length;
  this.analytics.abandonedResponses = abandoned.length;
  
  if (this.analytics.totalResponses > 0) {
    this.analytics.completionRate = (completed.length / this.analytics.totalResponses * 100);
  }
  
  if (completed.length > 0) {
    const totalTime = completed.reduce((sum, r) => sum + (r.session.timeSpent || 0), 0);
    this.analytics.averageTimeToComplete = totalTime / completed.length;
  }
  
  this.analytics.lastCalculated = new Date();
};

surveySchema.methods.publish = function(publishedBy) {
  this.lifecycle.status = 'active';
  this.lifecycle.publishedAt = new Date();
  this.lifecycle.publishedBy = publishedBy;
  return this.save();
};

surveySchema.methods.pause = function() {
  this.lifecycle.status = 'paused';
  return this.save();
};

surveySchema.methods.close = function() {
  this.lifecycle.status = 'completed';
  return this.save();
};

surveySchema.methods.archive = function(archivedBy) {
  this.isArchived = true;
  this.archivedAt = new Date();
  this.archivedBy = archivedBy;
  this.lifecycle.status = 'archived';
  return this.save();
};

surveySchema.methods.addCollaborator = function(collaboratorData) {
  this.collaborators.push(collaboratorData);
  return this.save();
};

surveySchema.methods.getResults = function() {
  const results = {};
  
  this.questions.forEach(question => {
    const questionResults = {
      question: question.title,
      type: question.type,
      responses: [],
      statistics: {}
    };
    
    // Collect all answers for this question
    const answers = this.responses
      .filter(r => r.session.status === 'completed')
      .map(r => r.answers.find(a => a.questionId.equals(question._id)))
      .filter(a => a && !a.metadata.skipped);
    
    questionResults.responses = answers.map(a => a.answer);
    
    // Calculate statistics based on question type
    if (question.type === 'rating' || question.type === 'scale' || question.type === 'number') {
      const numericAnswers = answers.map(a => Number(a.answer)).filter(n => !isNaN(n));
      if (numericAnswers.length > 0) {
        questionResults.statistics = {
          count: numericAnswers.length,
          average: numericAnswers.reduce((a, b) => a + b, 0) / numericAnswers.length,
          min: Math.min(...numericAnswers),
          max: Math.max(...numericAnswers),
          median: numericAnswers.sort((a, b) => a - b)[Math.floor(numericAnswers.length / 2)]
        };
      }
    } else if (question.type === 'multiple_choice' || question.type === 'single_choice') {
      const answerCounts = {};
      answers.forEach(a => {
        const answer = Array.isArray(a.answer) ? a.answer : [a.answer];
        answer.forEach(val => {
          answerCounts[val] = (answerCounts[val] || 0) + 1;
        });
      });
      questionResults.statistics = answerCounts;
    }
    
    results[question._id] = questionResults;
  });
  
  return results;
};

// =====================================
// STATIC METHODS
// =====================================
surveySchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    'lifecycle.status': 'active',
    $or: [
      { 'lifecycle.startsAt': { $exists: false } },
      { 'lifecycle.startsAt': { $lte: now } }
    ],
    $or: [
      { 'lifecycle.endsAt': { $exists: false } },
      { 'lifecycle.endsAt': { $gte: now } }
    ],
    isArchived: false
  });
};

surveySchema.statics.findByUser = function(userId) {
  return this.find({ 'createdBy.userId': userId })
    .sort({ createdAt: -1 });
};

surveySchema.statics.findAvailableForUser = function(userId, userRole, userBuilding) {
  return this.find({
    'lifecycle.status': 'active',
    $or: [
      { 'settings.access.type': 'public' },
      { 'settings.access.allowedRoles': userRole },
      { 'settings.access.allowedUsers': userId },
      { 'settings.access.allowedBuildings': userBuilding }
    ],
    isArchived: false
  });
};

surveySchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$lifecycle.status',
        count: { $sum: 1 },
        totalResponses: { $sum: '$analytics.totalResponses' },
        avgCompletionRate: { $avg: '$analytics.completionRate' }
      }
    }
  ]);
};

export default mongoose.model('Survey', surveySchema);
