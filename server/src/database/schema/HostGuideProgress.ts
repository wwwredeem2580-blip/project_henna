import mongoose from "mongoose";

const hostGuideProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    completedItems: [{
        type: String,
        trim: true
    }],
    currentLevel: {
        type: Number,
        default: 1
    },
    earnedBadges: [{
        type: String, // e.g., 'event_ready_lvl1', 'scanner_master'
        trim: true
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

hostGuideProgressSchema.index({ user: 1 });

export default hostGuideProgressSchema;
