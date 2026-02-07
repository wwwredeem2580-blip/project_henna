import mongoose from 'mongoose';
import { User } from '../database/auth/auth';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const deleteDummyUsers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/project_zenvy'
    );
    console.log('Connected!');

    // Regex to match emails ending with @zenvy.test
    const emailRegex = /@zenvy\.test$/i;

    // Count users first (safety visibility)
    const count = await User.countDocuments({ email: { $regex: emailRegex } });

    console.log(`Found ${count} dummy users to delete.`);

    if (count === 0) {
      console.log('No dummy users found.');
      return;
    }

    // Delete users
    const result = await User.deleteMany({
      email: { $regex: emailRegex }
    });

    console.log(`Deleted ${result.deletedCount} users successfully.`);

  } catch (error) {
    console.error('Error deleting dummy users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

deleteDummyUsers();
