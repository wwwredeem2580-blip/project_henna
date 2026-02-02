
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../database/auth/auth';
import { Event } from '../database/event/event';
import { Payout } from '../database/payout/payout';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PAYOUT_COUNT = 15;

const STATUSES = ['pending', 'approved', 'processing', 'completed', 'failed', 'on_hold', 'rejected'];
const PAYMENT_METHODS = ['bkash', 'bank_transfer', 'mobile_banking'];

const seedPayouts = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/project_zenvy');
    console.log('Connected!');

    // Get hosts and events
    const hosts = await User.find({ role: 'host' }).limit(5);
    if (hosts.length === 0) {
      console.log('No hosts found. Please seed users first.');
      return;
    }
    
    // Get events for these hosts
    const events = await Event.find({ hostId: { $in: hosts.map(h => h._id) } }).limit(20);
    if (events.length === 0) {
      console.log('No events found. Please seed events first.');
      return;
    }

    console.log(`Seeding ${PAYOUT_COUNT} payouts...`);
    
    // Clear existing payouts (optional, comment out if you want to append)
    // await Payout.deleteMany({}); 

    const payouts = [];

    for (let i = 0; i < PAYOUT_COUNT; i++) {
      const host = faker.helpers.arrayElement(hosts);
      // Find event belonging to host, or pick random if not found (fallback)
      const hostEvent = events.find(e => e.hostId.toString() === host._id.toString()) || faker.helpers.arrayElement(events);
      
      const status = faker.helpers.arrayElement(STATUSES);
      const paymentMethod = faker.helpers.arrayElement(PAYMENT_METHODS);
      
      const grossRevenue = faker.number.int({ min: 5000, max: 50000 });
      const refundAmount = faker.number.int({ min: 0, max: grossRevenue * 0.1 });
      const grossPayout = grossRevenue - refundAmount;
      const netPayout = grossPayout * 0.95; // 5% platform fee assumption

      const createdDate = faker.date.past();

      const payout = {
        payoutNumber: `PAYOUT-${faker.date.recent().toISOString().slice(0, 10).replace(/-/g, '')}-${faker.string.alphanumeric(6).toUpperCase()}`,
        hostId: host._id,
        eventId: hostEvent._id,
        
        // Financials
        grossRevenue,
        grossPayout,
        refundAmount,
        netPayout,
        currency: 'BDT',
        
        // Order Summary
        totalOrders: faker.number.int({ min: 10, max: 100 }),
        confirmedOrders: faker.number.int({ min: 8, max: 90 }),
        refundedOrders: faker.number.int({ min: 0, max: 5 }),
        totalTicketsSold: faker.number.int({ min: 20, max: 200 }),
        
        status,
        
        // Payment Details
        paymentMethod,
        accountNumber: paymentMethod === 'bank_transfer' ? faker.finance.accountNumber() : faker.phone.number(),
        accountHolderName: host.firstName + ' ' + host.lastName,
        bankName: paymentMethod === 'bank_transfer' ? faker.company.name() + ' Bank' : undefined,
        branchName: paymentMethod === 'bank_transfer' ? faker.location.street() + ' Branch' : undefined,
        
        // Timestamps based on status
        initiatedAt: ['processing', 'completed', 'failed'].includes(status) ? faker.date.recent() : undefined,
        completedAt: status === 'completed' ? faker.date.recent() : undefined,
        failedAt: status === 'failed' ? faker.date.recent() : undefined,
        approvedAt: ['approved', 'processing', 'completed'].includes(status) ? faker.date.recent() : undefined,
        
        // Notes
        adminNotes: Math.random() > 0.7 ? faker.lorem.sentence() : undefined,
        hostNotes: Math.random() > 0.8 ? faker.lorem.sentence() : undefined,
        
        createdAt: createdDate,
        updatedAt: createdDate
      };

      payouts.push(payout);
    }

    // Batch insert
    await Payout.insertMany(payouts);
    console.log('Payouts seeded successfully!');

  } catch (error) {
    console.error('Error seeding payouts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

seedPayouts();
