import http from 'k6/http';
import { sleep, check } from 'k6';
import { SharedArray } from 'k6/data';

// -----------------------
// K6 Options
// -----------------------
export const options = {
  stages: [
    { duration: '1m', target: 5 },   // Ramp-up
    { duration: '3m', target: 10 },   // Sustained load
    { duration: '1m', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.02'],    // Max 2% errors
    http_req_duration: ['p(95)<2000'], // 95% requests < 2s
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

const BASE_URL = 'https://zenvy.com.bd';

// -----------------------
// Main Test Function
// -----------------------
export default function () {

  // -----------------------
  // 1️⃣ Pick Random Test User & Login
  // -----------------------
  const user = users[Math.floor(Math.random() * users.length)];

  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: user.email, password: user.password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  check(loginRes, { 'login success': r => r.status === 200 });

  const token = loginRes.json('token');
  if (!token) return;

  const authHeaders = { 
    headers: { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    } 
  };

  sleep(Math.random() * 2 + 1); // human-like think time

  // -----------------------
  // 2️⃣ Fetch Public Events
  // -----------------------
  const eventsRes = http.get(`${BASE_URL}/api/event/public?page=1&limit=20`, authHeaders);
  check(eventsRes, { 'events fetched': r => r.status === 200 });

  const eventsData = eventsRes.json();
  if (!eventsData || !eventsData.events || eventsData.events.length === 0) return;

  // Pick random event
  const event = eventsData.events[Math.floor(Math.random() * eventsData.events.length)];

  sleep(Math.random() * 2 + 1);

  // -----------------------
  // 3️⃣ Fetch Event Details (includes tickets)
  // -----------------------
  const eventDetailsRes = http.get(
    `${BASE_URL}/api/event/public/${event.slug || event._id}`, 
    authHeaders
  );
  check(eventDetailsRes, { 'event details fetched': r => r.status === 200 });

  const eventDetails = eventDetailsRes.json();
  if (!eventDetails || !eventDetails.tickets || eventDetails.tickets.length === 0) return;

  // Pick random available ticket variant
  const availableTickets = eventDetails.tickets.filter(t => 
    t.isActive && t.quantity > t.sold
  );
  
  if (availableTickets.length === 0) return;
  
  const ticketVariant = availableTickets[Math.floor(Math.random() * availableTickets.length)];

  sleep(Math.random() * 1 + 1);

  // -----------------------
  // 4️⃣ Create Order (FIXED PAYLOAD)
  // -----------------------
  const orderPayload = {
    eventId: eventDetails._id,
    tickets: [
      {
        ticketVariantId: ticketVariant._id,
        variantName: ticketVariant.name,
        quantity: 1,
        pricePerTicket: ticketVariant.price?.amount || 0
      }
    ],
    paymentMethod: ticketVariant.price?.amount === 0 ? 'free' : 'bkash'
  };

  const orderRes = http.post(
    `${BASE_URL}/api/order`, 
    JSON.stringify(orderPayload), 
    authHeaders
  );
  check(orderRes, { 'order created': r => r.status === 201 });

  const order = orderRes.json();
  if (!order || !order.orderId) return;

  sleep(Math.random() * 2 + 1);

  // -----------------------
  // 5️⃣ Simulate Payment (FIXED CALLBACK)
  // -----------------------
  if (order.isFree) {
    // Free ticket - already confirmed
    console.log(`Free ticket order ${order.orderId} confirmed`);
  } else if (order.paymentId) {
    // Simulate bKash payment callback
    const paymentRes = http.get(
      `${BASE_URL}/api/order/bkash/callback?orderId=${order.orderId}&paymentId=${order.paymentId}`, 
      authHeaders
    );
    check(paymentRes, { 'payment processed': r => r.status === 200 });
  }

  sleep(Math.random() * 2 + 1);

  // -----------------------
  // 6️⃣ Verify Wallet / Order appears
  // -----------------------
  const walletRes = http.get(`${BASE_URL}/api/wallet`, authHeaders);
  check(walletRes, { 'wallet updated': r => r.status === 200 });

  sleep(Math.random() * 2 + 1);
}
