import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    // Personal Identity (Primary Contact Person)
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    photo: {
        type: String
    },

    // Business Information (only for hosts)
    businessName: {
        type: String,
        required: function(this: any) { return this.role === 'host'; },
        trim: true,
        index: true
    },
    businessEmail: {
        type: String,
        required: function(this: any) { return this.role === 'host'; },
        lowercase: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: function(this: any) { return this.role === 'host'; },
        trim: true
    },
    phoneVerified: {
        type: Boolean,
        default: false,
        index: true
    },
    website: {
        type: String,
        trim: true
    },
    
    // Company Details (only for hosts)
    companySize: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
        required: false
    },
    companyType: {
        type: String,
        enum: ['organizer', 'venue_owner', 'representative', 'artist'],
        required: function() { return this.role === 'host'; }
    },
    // industry: {
    //     type: String,
    //     trim: true
    // },
    // monthlyRevenue: {
    //     type: String,
    //     enum: ['<10k', '10k-50k', '50k-100k', '100k-500k', '500k+'],
    //     default: '10k-50k'
    // },
    
    // Widget & Subscription
    widgetId: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    plan: {
        type: String,
        enum: ['free', 'starter', 'growth', 'enterprise'],
        default: 'free',
        index: true
    },
    onboardingCompleted: {
        type: Boolean,
        default: false,
        index: true
    },
    
    // Auth
    password: {
        type: String // Optional for OAuth users
    },
    provider: {
        type: String,
        enum: ['google', 'local'],
        default: 'local'
    },
    googleId: {
        type: String,
        sparse: true,
        unique: true
    },
    refreshToken: {
        type: String
    },
    
    // Verification Status
    emailVerified: {
        type: Boolean,
        default: false,
        index: true
    },
    
    // Role (B2B Team Structure)
    role: {
        type: String,
        enum: ['user', 'host', 'admin'],
        default: 'user',
        index: true
    },
    
    // Account Status
    isSuspended: {
        type: Boolean,
        default: false,
        index: true
    },
    suspensionReason: {
        type: String
    },
    suspendedAt: {
        type: Date
    },
    suspendedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Metadata
    lastLoginAt: {
        type: Date
    },
    lastLoginIP: {
        type: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for common queries
userSchema.index({ email: 1 });
userSchema.index({ businessName: 1 });
userSchema.index({ widgetId: 1 }, { sparse: true });
userSchema.index({ role: 1, isSuspended: 1 });
userSchema.index({ plan: 1, isSuspended: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ emailVerified: 1, role: 1 });
userSchema.index({ onboardingCompleted: 1 });

// Pre-save hook: Generate widgetId if not exists
// userSchema.pre('save', function(this: any, next: (err?: Error) => void) {
//     if (!this.widgetId && this.isNew) {
//         // Generate unique widget ID: zny_<timestamp>_<random>
//         this.widgetId = `zny_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
//     }
//     next();
// });

// Virtual: Full Name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual: Is Active
userSchema.virtual('isActive').get(function() {
    return !this.isSuspended;
});

export default userSchema;
