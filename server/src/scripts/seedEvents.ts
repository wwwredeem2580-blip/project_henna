import mongoose from 'mongoose';
import { Event } from '../database/event/event';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const HOST_ID = '6978a188a743215c3d8b48e1';
const EVENT_COUNT = 25;

const CATEGORIES = [
  'concert', 'sports', 'conference', 'festival', 'theater', 
  'comedy', 'networking', 'workshop', 'other'
];

const LOCATIONS = [
  { city: 'Dhaka', coords: [90.4125, 23.8103] },
  { city: 'Chittagong', coords: [91.7832, 22.3569] },
  { city: 'Sylhet', coords: [91.8687, 24.8949] },
  { city: 'Cox\'s Bazar', coords: [91.9859, 21.4272] },
];

const generateTickets = () => {
  const count = faker.number.int({ min: 1, max: 3 });
  const tickets = [];
  
  for (let i = 0; i < count; i++) {
    tickets.push({
      name: faker.commerce.productAdjective() + ' Ticket',
      description: faker.lorem.sentence(),
      price: {
        amount: faker.number.int({ min: 500, max: 5000 }),
        currency: 'BDT'
      },
      quantity: faker.number.int({ min: 50, max: 500 }),
      sold: faker.number.int({ min: 0, max: 20 }),
      reserved: 0,
      isActive: true,
      isVisible: true,
      tier: faker.helpers.arrayElement(['Regular', 'VIP', 'Early Bird']),
      limits: {
        minPerOrder: 1,
        maxPerOrder: 5
      },
      wristbandColor: faker.color.rgb(),
      accentColor: faker.color.rgb(),
    });
  }
  return tickets;
};

const seedEvents = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/project_zenvy');
    console.log('Connected!');

    console.log(`Seeding ${EVENT_COUNT} events for host ${HOST_ID}...`);
    
    const events = [];
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    await Event.deleteMany({ hostId: HOST_ID });

    for (let i = 0; i < EVENT_COUNT; i++) {
      const startDate = faker.date.between({ from: today, to: nextMonth });
      const endDate = new Date(startDate.getTime() + faker.number.int({ min: 2, max: 8 }) * 60 * 60 * 1000); // 2-8 hours duration
      const location = faker.helpers.arrayElement(LOCATIONS);
      const isLive = startDate <= new Date() && endDate >= new Date();
      const status = isLive ? 'live' : 'published';

      const imageThemes = ['concert', 'festival', 'music', 'nightlife', 'party', 'crowd', 'forest', 'stage'];
      const getPicsumUrl = (width: number, height: number) => {
        const seed = faker.string.alphanumeric(10);
        return `https://picsum.photos/seed/${seed}/${width}/${height}`;
      };

      const event = {
        hostId: HOST_ID,
        title: faker.company.catchPhrase(),
        category: faker.helpers.arrayElement(CATEGORIES),
        subCategory: [faker.music.genre()],
        tagline: faker.company.catchPhraseDescriptor(),
        description: faker.lorem.paragraphs(3),
        highlights: [faker.lorem.sentence(), faker.lorem.sentence(), faker.lorem.sentence()],
        media: {
          coverImage: {
            url: getPicsumUrl(800, 400),
            thumbnailUrl: getPicsumUrl(400, 200),
            alt: 'Event Cover'
          },
          gallery: [
            { url: getPicsumUrl(800, 400), caption: 'Gallery 1', order: 1 },
            { url: getPicsumUrl(800, 400), caption: 'Gallery 2', order: 2 },
            { url: getPicsumUrl(800, 400), caption: 'Gallery 3', order: 3 }
          ]
        },
        schedule: {
          startDate: startDate,
          endDate: endDate,
          timezone: 'Asia/Dhaka',
          type: 'single'
        },
        venue: {
          name: faker.company.name() + ' Hall',
          address: {
            street: faker.location.streetAddress(),
            city: location.city,
            country: 'Bangladesh'
          },
          coordinates: {
            type: 'Point',
            coordinates: location.coords
          },
          capacity: faker.number.int({ min: 100, max: 5000 }),
          type: 'indoor',
          parking: true
        },
        organizer: {
          host: 'Zenvy Host',
          companyName: faker.company.name(),
          companyEmail: faker.internet.email(),
          companyType: 'organizer'
        },
        tickets: generateTickets(),
        status: status,
        moderation: {
          visibility: 'public',
          features: {
            isFeatured: Math.random() < 0.2, // 20% chance of being featured
            featuredPriority: faker.number.int({ min: 1, max: 10 })
          }
        },
        metrics: {
            views: faker.number.int({ min: 50, max: 1000 }),
            uniqueViews: faker.number.int({ min: 20, max: 800 }),
            ticketsSold: faker.number.int({ min: 0, max: 50 })
        },
        slug: faker.helpers.slugify(faker.company.catchPhrase() + '-' + faker.string.alphanumeric(6)).toLowerCase()
      };

      events.push(event);
    }

    // Batch insert
    await Event.insertMany(events);
    console.log('Events seeded successfully!');

  } catch (error) {
    console.error('Error seeding events:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

seedEvents();
