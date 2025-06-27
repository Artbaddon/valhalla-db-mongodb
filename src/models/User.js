import mongoose from 'mongoose';

// =====================================
// USER SCHEMA (Enhanced from SQL users table)
// =====================================
const userSchema = new mongoose.Schema({
  // From your users table
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },

  // Authentication fields (enhanced)
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },

  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters']
  },

  // User status (reference to UserStatus model)
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'suspended', 'pending', 'blocked'],
    default: 'pending',
    index: true
  },

  // User role (reference to Role model)
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, 'User role is required'],
    index: true
  },

  // Alternative: role type for quick queries (denormalized)
  roleType: {
    type: String,
    enum: ['admin', 'manager', 'guard', 'owner', 'resident', 'guest'],
    index: true,
    default: 'resident'
  },

  // EMBEDDED PROFILE (replaces profile table)
  profile: {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      enum: {
        values: ['CC', 'CE', 'TI', 'PP', 'NIT'],
        message: 'Document type must be: CC, CE, TI, PP, or NIT'
      }
    },
    
    documentNumber: {
      type: String,
      required: [true, 'Document number is required'],
      unique: true,
      trim: true,
      maxlength: [30, 'Document number cannot exceed 30 characters']
    },
    
    telephoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [12, 'Phone number cannot exceed 12 characters'],
      match: [/^[0-9+\-\s()]+$/, 'Please enter a valid phone number']
    },
    
    photo: {
      type: String,
      default: null
    }
  },

  // EMBEDDED OWNER INFO (only if user is owner - replaces owner table)
  ownerInfo: {
    isActive: {
      type: Boolean,
      default: true
    },
    
    isTenant: {
      type: Boolean,
      default: false
    },
    
    birthDate: {
      type: Date,
      validate: {
        validator: function(date) {
          return date < new Date();
        },
        message: 'Birth date must be in the past'
      }
    },

    // EMBEDDED PETS (replaces pet table)
    pets: [{
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [30, 'Pet name cannot exceed 30 characters']
      },
      
      species: {
        type: String,
        required: true,
        trim: true,
        maxlength: [30, 'Species cannot exceed 30 characters']
      },
      
      breed: {
        type: String,
        trim: true,
        maxlength: [30, 'Breed cannot exceed 30 characters']
      },
      
      vaccinationCard: {
        type: String,
        default: null
      },
      
      photo: {
        type: String,
        default: null
      },
      
      isActive: {
        type: Boolean,
        default: true
      },
      
      registeredAt: {
        type: Date,
        default: Date.now
      }
    }],

    // Apartment associations
    apartments: [{
      apartmentId: Number,
      apartmentNumber: String,
      towerName: String,
      isOwner: { type: Boolean, default: true },
      isTenant: { type: Boolean, default: false },
      moveInDate: Date,
      moveOutDate: Date
    }]
  },

  // EMBEDDED GUARD INFO (only if user is guard - replaces guard table)
  guardInfo: {
    arl: {
      type: String,
      trim: true,
      maxlength: [30, 'ARL cannot exceed 30 characters']
    },
    
    eps: {
      type: String,
      trim: true,
      maxlength: [30, 'EPS cannot exceed 30 characters']
    },
    
    shift: {
      type: String,
      enum: {
        values: ['morning', 'afternoon', 'night', 'rotating'],
        message: 'Shift must be: morning, afternoon, night, or rotating'
      }
    },
    
    isActive: {
      type: Boolean,
      default: true
    },
    
    startDate: {
      type: Date,
      default: Date.now
    }
  },

  // Last login tracking
  lastLogin: {
    type: Date,
    default: null
  },

  // Account verification
  isVerified: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// =====================================
// INDEXES
// =====================================
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ 'profile.documentNumber': 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ 'ownerInfo.isActive': 1 });
userSchema.index({ createdAt: -1 });

// =====================================
// VIRTUAL FIELDS
// =====================================
userSchema.virtual('fullProfile').get(function() {
  return {
    id: this._id,
    username: this.username,
    fullName: this.profile.fullName,
    role: this.role,
    status: this.status
  };
});

// =====================================
// INSTANCE METHODS
// =====================================
userSchema.methods.addPet = function(petData) {
  if (!this.ownerInfo) {
    this.ownerInfo = { pets: [] };
  }
  this.ownerInfo.pets.push(petData);
  return this.save();
};

userSchema.methods.removePet = function(petId) {
  if (this.ownerInfo && this.ownerInfo.pets) {
    this.ownerInfo.pets.id(petId).remove();
    return this.save();
  }
};

// =====================================
// STATIC METHODS
// =====================================
userSchema.statics.findByRole = function(role) {
  return this.find({ role: role, status: 'active' });
};

userSchema.statics.findOwners = function() {
  return this.find({ 
    role: 'owner', 
    status: 'active',
    'ownerInfo.isActive': true 
  });
};

userSchema.statics.findGuards = function() {
  return this.find({ 
    role: 'guard', 
    status: 'active',
    'guardInfo.isActive': true 
  });
};

// =====================================
// PRE-SAVE MIDDLEWARE
// =====================================
userSchema.pre('save', function(next) {
  if (this.role === 'owner' && !this.ownerInfo) {
    this.ownerInfo = {
      isActive: true,
      isTenant: false,
      pets: [],
      apartments: []
    };
  }
  
  if (this.roleType === 'guard' && !this.guardInfo) {
    this.guardInfo = {
      isActive: true
    };
  }
  
  next();
});

// Static methods for role-based queries
userSchema.statics.findByRole = function(roleId) {
  return this.find({ role: roleId, status: 'active' })
    .populate('role', 'name description type level');
};

userSchema.statics.findByRoleType = function(roleType) {
  return this.find({ roleType, status: 'active' })
    .populate('role', 'name description type level');
};

// Instance methods for permissions
userSchema.methods.hasPermission = function(permissionName) {
  if (!this.role || !this.role.modules) return false;
  
  for (const module of this.role.modules) {
    if (module.permissions.some(perm => perm.name === permissionName)) {
      return true;
    }
  }
  return false;
};

userSchema.methods.hasModuleAccess = function(moduleName) {
  if (!this.role || !this.role.modules) return false;
  return this.role.modules.some(module => module.module.name === moduleName);
};

userSchema.methods.canAccess = function(resource, action) {
  if (!this.role) return false;
  
  const permissionName = `${action}_${resource}`;
  return this.hasPermission(permissionName);
};

export default mongoose.model('User', userSchema);
