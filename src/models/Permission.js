import mongoose from 'mongoose';

// Permission Schema
const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Permission name is required'],
    trim: true,
    maxlength: [30, 'Permission name cannot exceed 30 characters'],
    unique: true,
    lowercase: true
  },
  
  description: {
    type: String,
    required: [true, 'Permission description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Permission category for organization
  category: {
    type: String,
    required: true,
    enum: ['user', 'apartment', 'parking', 'pqrs', 'reservation', 'notification', 'payment', 'survey', 'system'],
    index: true
  },
  
  // Action type
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'manage', 'approve', 'reject'],
    index: true
  },
  
  // Resource - what this permission applies to
  resource: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Resource name cannot exceed 50 characters']
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'permissions'
});

// Module Schema
const moduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Module name is required'],
    trim: true,
    maxlength: [30, 'Module name cannot exceed 30 characters'],
    unique: true
  },
  
  description: {
    type: String,
    required: [true, 'Module description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Module path/route
  path: {
    type: String,
    trim: true,
    maxlength: [100, 'Path cannot exceed 100 characters'],
    unique: true,
    sparse: true
  },
  
  // Icon for UI
  icon: {
    type: String,
    trim: true,
    maxlength: [50, 'Icon name cannot exceed 50 characters']
  },
  
  // Display order
  order: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Parent module for hierarchical structure
  parentModule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    default: null
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Menu visibility
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'modules'
});

// Role Schema
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    trim: true,
    maxlength: [30, 'Role name cannot exceed 30 characters'],
    unique: true
  },
  
  description: {
    type: String,
    required: [true, 'Role description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Role level (for hierarchy)
  level: {
    type: Number,
    required: true,
    min: [1, 'Role level must be at least 1'],
    max: [10, 'Role level cannot exceed 10'],
    default: 5
  },
  
  // Role type
  type: {
    type: String,
    required: true,
    enum: ['admin', 'manager', 'guard', 'owner', 'resident', 'guest'],
    index: true
  },
  
  // Module access
  modules: [{
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true
    },
    permissions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permission',
      required: true
    }]
  }],
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // System role (cannot be deleted)
  isSystem: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'roles'
});

// User Status Schema
const userStatusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User status name is required'],
    trim: true,
    maxlength: [30, 'Status name cannot exceed 30 characters'],
    unique: true,
    enum: ['active', 'inactive', 'suspended', 'pending', 'blocked']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  
  // Status behavior
  allowLogin: {
    type: Boolean,
    default: true
  },
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'user_statuses'
});

// Indexes
permissionSchema.index({ category: 1, action: 1 });
permissionSchema.index({ name: 1, isActive: 1 });

moduleSchema.index({ name: 1, isActive: 1 });
moduleSchema.index({ parentModule: 1, order: 1 });

roleSchema.index({ name: 1, isActive: 1 });
roleSchema.index({ type: 1, level: 1 });
roleSchema.index({ 'modules.module': 1 });

// Virtuals
moduleSchema.virtual('fullPath').get(function() {
  if (!this.parentModule) return this.path;
  return `${this.parentModule.path}${this.path}`;
});

roleSchema.virtual('permissionCount').get(function() {
  return this.modules.reduce((total, module) => total + module.permissions.length, 0);
});

// Static methods for Permission
permissionSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ name: 1 });
};

permissionSchema.statics.findByAction = function(action) {
  return this.find({ action, isActive: true }).sort({ category: 1, name: 1 });
};

// Static methods for Module
moduleSchema.statics.getHierarchy = function() {
  return this.find({ isActive: true })
    .populate('parentModule', 'name path')
    .sort({ order: 1, name: 1 });
};

moduleSchema.statics.getRootModules = function() {
  return this.find({ parentModule: null, isActive: true, isVisible: true })
    .sort({ order: 1, name: 1 });
};

// Static methods for Role
roleSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true })
    .populate({
      path: 'modules.module',
      select: 'name description path'
    })
    .populate({
      path: 'modules.permissions',
      select: 'name description category action'
    })
    .sort({ level: 1, name: 1 });
};

roleSchema.statics.findWithPermissions = function(roleId) {
  return this.findById(roleId)
    .populate({
      path: 'modules.module',
      select: 'name description path icon'
    })
    .populate({
      path: 'modules.permissions',
      select: 'name description category action resource'
    });
};

// Instance methods for Role
roleSchema.methods.hasPermission = function(permissionName) {
  for (const module of this.modules) {
    if (module.permissions.some(perm => perm.name === permissionName)) {
      return true;
    }
  }
  return false;
};

roleSchema.methods.hasModuleAccess = function(moduleName) {
  return this.modules.some(module => module.module.name === moduleName);
};

roleSchema.methods.addModulePermissions = function(moduleId, permissionIds) {
  const existingModule = this.modules.find(m => m.module.toString() === moduleId.toString());
  
  if (existingModule) {
    // Add new permissions to existing module
    permissionIds.forEach(permId => {
      if (!existingModule.permissions.includes(permId)) {
        existingModule.permissions.push(permId);
      }
    });
  } else {
    // Add new module with permissions
    this.modules.push({
      module: moduleId,
      permissions: permissionIds
    });
  }
  
  return this.save();
};

roleSchema.methods.removeModulePermissions = function(moduleId, permissionIds = null) {
  const moduleIndex = this.modules.findIndex(m => m.module.toString() === moduleId.toString());
  
  if (moduleIndex === -1) return this;
  
  if (permissionIds === null) {
    // Remove entire module
    this.modules.splice(moduleIndex, 1);
  } else {
    // Remove specific permissions
    const module = this.modules[moduleIndex];
    module.permissions = module.permissions.filter(
      perm => !permissionIds.includes(perm.toString())
    );
    
    // Remove module if no permissions left
    if (module.permissions.length === 0) {
      this.modules.splice(moduleIndex, 1);
    }
  }
  
  return this.save();
};

// Pre-save middleware
roleSchema.pre('save', function(next) {
  // Ensure system roles cannot have their isSystem flag changed
  if (this.isModified('isSystem') && this.isSystem === false && this.name in ['super_admin', 'admin', 'owner']) {
    this.isSystem = true;
  }
  next();
});

// Create models
export const Permission = mongoose.model('Permission', permissionSchema);
export const Module = mongoose.model('Module', moduleSchema);
export const Role = mongoose.model('Role', roleSchema);
export const UserStatus = mongoose.model('UserStatus', userStatusSchema);

// Default export
export default { Permission, Module, Role, UserStatus };
