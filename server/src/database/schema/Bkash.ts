import mongoose from 'mongoose';

const bkashSchema = new mongoose.Schema({
    auth_token: {
        type: String,
        required: true,
    }
}, { timestamps: true });

export default bkashSchema;