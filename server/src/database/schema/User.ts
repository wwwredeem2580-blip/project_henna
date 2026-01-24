import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // Identity
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

    // Email Addresses (Primary & Secondary)
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
    
    // Auth
    password: {
        type: String // Optional for OAuth users
    },
    provider: {
        type: String,
        enum: ['google', 'local', 'facebook'],
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
    
    // Verification Status (denormalized for quick access)
    emailVerified: {
        type: Boolean,
        default: false,
        index: true
    },
    
    // Role
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
        index: true
    },
    
    // Moderation (flattened from nested object)
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
userSchema.index({ role: 1, isSuspended: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ emailVerified: 1, role: 1 });

// Virtual: Full Name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual: Is Active
userSchema.virtual('isActive').get(function() {
    return !this.isSuspended;
});

export default userSchema;
