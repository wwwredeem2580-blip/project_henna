import http from 'k6/http';
import { sleep, check } from 'k6';
import { SharedArray } from 'k6/data';
import { Rate, Trend } from 'k6/metrics';

// -----------------------
// Custom Metrics
// -----------------------
const bookingSuccessRate = new Rate('booking_success');
const orderCreationTime = new Trend('order_creation_duration');
const paymentTime = new Trend('payment_duration');

// -----------------------
// K6 Options - Realistic Load Test
// -----------------------
export const options = {
  stages: [
    { duration: '30s', target: 50 },    // Warm-up
    { duration: '2m', target: 200 },    // Ramp to moderate load
    { duration: '5m', target: 400 },    // Sustained moderate load
    { duration: '2m', target: 800 },    // Peak load
    { duration: '3m', target: 800 },    // Sustained peak
    { duration: '2m', target: 200 },    // Ramp down
    { duration: '30s', target: 0 },     // Cool down
  ],
  thresholds: {
    'http_req_failed': ['rate<0.02'],           // Max 2% errors
    'http_req_duration': ['p(95)<2000'],        // 95% requests < 2s
    'http_req_duration{name:login}': ['p(95)<1000'],
    'http_req_duration{name:events}': ['p(95)<1500'],
    'http_req_duration{name:event_details}': ['p(95)<1000'],
    'http_req_duration{name:create_order}': ['p(95)<2000'],
    'booking_success': ['rate>0.98'],           // 98% booking success
  },
};

// -----------------------
// Load Test Users from CSV
// -----------------------
const users = new SharedArray('users', function () {
  return open('./dummy_users.csv')
    .split('\n')
    .slice(1) // skip header
    .filter(line => line.trim()) // remove empty lines
    .map(line => {
      const [email, password] = line.split(',').map(s => s.trim());
      return { email, password };
    });
});

const BASE_URL = __ENV.BASE_URL || 'https://zenvy.com.bd';
const API_URL = `${BASE_URL}/api`;

// -----------------------
// Helper Functions
// -----------------------
function randomSleep(min = 1, max = 3) {
  sleep(Math.random() * (max - min) + min);
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// -----------------------
// Main Test Scenarios
// -----------------------
export default function () {
  // Pick random user
  const user = pickRandom(users);
  
  // -----------------------
  // 1️⃣ Login
  // -----------------------
  const loginRes = http.post(
    `${API_URL}/auth/login`,
    JSON.stringify({ 
      email: user.email, 
      password: user.password 
    }),
    { 
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'login' }
    }
  );

  const loginSuccess = check(loginRes, {
    'login: status 200': (r) => r.status === 200,
    // 'login: has token': (r) => r.json('token') !== undefined, // Removed: Token is in cookie, not body
  });

  if (!loginSuccess) {
    console.error(`Login failed for ${user.email}: ${loginRes.status}`);
    return;
  }

  // const token = loginRes.json('token'); // Removed
  const authHeaders = {
    headers: {
      // 'Authorization': `Bearer ${token}`, // Removed: Cookie handled automatically
      'Content-Type': 'application/json',
    },
  };

  randomSleep(1, 2);

  // -----------------------
  // 2️⃣ Browse Public Events
  // -----------------------
  const eventsRes = http.get(
    `${API_URL}/event/public?page=1&limit=20`,
    {
      headers: authHeaders.headers,
      tags: { name: 'events' }
    }
  );

  const eventsSuccess = check(eventsRes, {
    'events: status 200': (r) => r.status === 200,
    'events: has data': (r) => {
      const body = r.json();
      return body && body.events && body.events.length > 0;
    },
  });

  if (!eventsSuccess) {
    console.error('Failed to fetch events');
    return;
  }

  const eventsData = eventsRes.json();
  const events = eventsData.events;
  
  if (!events || events.length === 0) {
    console.log('No events available');
    return;
  }

  // Pick random event
  const event = pickRandom(events);
  
  randomSleep(2, 4);

  // -----------------------
  // 3️⃣ View Event Details
  // -----------------------
  const eventDetailsRes = http.get(
    `${API_URL}/event/public/${event.slug || event._id}`,
    {
      headers: authHeaders.headers,
      tags: { name: 'event_details' }
    }
  );

  const detailsSuccess = check(eventDetailsRes, {
    'event details: status 200': (r) => r.status === 200,
    'event details: has tickets': (r) => {
      const body = r.json();
      return body && body.tickets && body.tickets.length > 0;
    },
  });

  if (!detailsSuccess) {
    console.error(`Failed to fetch event details for ${event.slug || event._id}`);
    return;
  }

  const eventDetails = eventDetailsRes.json();
  const tickets = eventDetails.tickets.filter(t => t.isActive && t.quantity > t.sold);
  
  if (!tickets || tickets.length === 0) {
    console.log('No available tickets for this event');
    return;
  }

  // Pick random ticket variant
  const ticketVariant = pickRandom(tickets);
  
  randomSleep(2, 5);

  // -----------------------
  // 4️⃣ Create Order
  // -----------------------
  const orderPayload = {
    eventId: eventDetails._id,
    tickets: [
      {
        ticketVariantId: ticketVariant._id,
        variantName: ticketVariant.name,
        quantity: 1,
        pricePerTicket: ticketVariant.price?.amount || 0,
      }
    ],
    paymentMethod: ticketVariant.price?.amount === 0 ? 'free' : 'bkash',
  };

  const orderStart = Date.now();
  const orderRes = http.post(
    `${API_URL}/order`,
    JSON.stringify(orderPayload),
    {
      headers: authHeaders.headers,
      tags: { name: 'create_order' }
    }
  );
  orderCreationTime.add(Date.now() - orderStart);

  const orderSuccess = check(orderRes, {
    'order: status 201': (r) => r.status === 201,
    'order: has orderId': (r) => {
      const body = r.json();
      return body && body.orderId;
    },
  });

  if (!orderSuccess) {
    console.error(`Order creation failed: ${orderRes.status} - ${orderRes.body}`);
    bookingSuccessRate.add(0);
    return;
  }

  const order = orderRes.json();
  
  randomSleep(1, 2);

  // -----------------------
  // 5️⃣ Handle Payment
  // -----------------------
  let paymentSuccess = false;

  if (order.isFree) {
    // Free ticket - order is already confirmed
    paymentSuccess = true;
    bookingSuccessRate.add(1);
  } else if (order.paymentId) {
    // Simulate payment callback
    const paymentStart = Date.now();
    const callbackRes = http.get(
      `${API_URL}/order/bkash/callback?orderId=${order.orderId}&paymentId=${order.paymentId}`,
      {
        headers: authHeaders.headers,
        tags: { name: 'payment_callback' }
      }
    );
    paymentTime.add(Date.now() - paymentStart);

    paymentSuccess = check(callbackRes, {
      'payment: status 200': (r) => r.status === 200,
      'payment: success true': (r) => {
        const body = r.json();
        return body && body.success === true;
      },
    });

    bookingSuccessRate.add(paymentSuccess ? 1 : 0);

    if (!paymentSuccess) {
      console.error(`Payment failed for order ${order.orderId}`);
    }
  }

  randomSleep(1, 2);

  // -----------------------
  // 6️⃣ Verify Order in Wallet (Optional)
  // -----------------------
  if (paymentSuccess) {
    const walletRes = http.get(
      `${API_URL}/wallet`,
      {
        headers: authHeaders.headers,
        tags: { name: 'wallet' }
      }
    );

    check(walletRes, {
      'wallet: status 200': (r) => r.status === 200,
    });
  }

  randomSleep(1, 3);
}

// -----------------------
// Scenario: Browse Only (No Booking)
// -----------------------
export function browseOnly() {
  const user = pickRandom(users);
  
  const loginRes = http.post(
    `${API_URL}/auth/login`,
    JSON.stringify({ email: user.email, password: user.password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (loginRes.status !== 200) return;

  // const token = loginRes.json('token'); // Removed
  const authHeaders = {
    headers: { 
      // 'Authorization': `Bearer ${token}` // Removed
      'Content-Type': 'application/json'
    },
  };

  randomSleep(1, 2);

  // Browse events
  http.get(`${API_URL}/event/public?page=1&limit=20`, authHeaders);
  randomSleep(2, 4);

  // View trending
  http.get(`${API_URL}/event/public/trending?limit=10`, authHeaders);
  randomSleep(2, 4);

  // View featured
  http.get(`${API_URL}/event/public/featured?limit=10`, authHeaders);
  randomSleep(1, 3);
}
